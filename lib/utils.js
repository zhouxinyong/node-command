var path = require('path');
var fs = require('fs');
var markdown = require('markdown-it');
var md = new markdown({
	html: true,
	langPrefix: 'code-'
});
var swig = require('swig');
swig.setDefaults({
	cache: false
})
var rd = require('rd');


//去掉文件名中的扩展名
function stripExtname(name){
	var i = 0 - path.extname(name).length;
	if(i === 0){
		i = name.length;
	}
	 return name.slice(0,i);
}

//将markdown转换为html
function markdownToHtml(content){
	return md.render(content || '');
}

//解析文章内容
function parseSourceContent(data){
	var  split = '---\r\n';
	console.log('content:'+data+'\n');
	var i =data.indexOf(split);
	var info = {};
	console.log('i:'+i);
	if(i !== -1){
		var j = data.indexOf(split,i+split.length);
		console.log('j:'+j);
		if(j !== -1){
			var str = data.slice(i + split.length, j).trim();
			console.log('str:'+str+'\n');
			data = data.slice(j + split.length);
			console.log('data:'+data+'\n');
			str.split('\r\n').forEach(function(line){
				var i =line.indexOf(':');
				if(i !== -1){
					var name = line.slice(0,i).trim();
					var value = line.slice(i + 1).trim();
					info[name] = value;
				}
			})
		}
	}
	info.source = data;
	console.log('info:'+info);
	return info;
}

//渲染模板
function renderFile(file, data){
	return swig.render(fs.readFileSync(file).toString(),{
		filename: file,
		autoescape: false,
		locals: data
	})
}

//遍历所有文章列表
 function eachSource(dir,callback){
	return rd.eachFileFilterSync(dir,/\.md$/,callback);
}

/**
 * 渲染文章 
 */

function renderPost(dir,file){
	var content = fs.readFileSync(file).toString(); //获取文章内容
	var post = parseSourceContent(content.toString());
	post.content = markdownToHtml(post.source);
	post.layout = post.layout || 'post';
	var html = renderFile(path.resolve(dir, '_layout', post.layout + '.html'),{post: post});

	return html;

}



/**
 * 渲染列表
 */
function renderIndex(dir){
	var list = [];
	var sourceDir = path.resolve(dir , '_posts');
	rd.eachFileFilterSync(sourceDir,/\.md$/,function(file,sources){
			var source = fs.readFileSync(file).toString();
			var post = parseSourceContent(source);
			post.timestamp = new Date(post.date);
			post.url = '/posts/' + stripExtname(file.slice(sourceDir.length+1)) + '.html';
			list.push(post);
		});
       	
   	list.sort(function(a,b){
   		return b.timestamp - a.timestamp;
   	});

   	var html = renderFile(path.resolve(dir,'_layout','index.html'),{
   		posts:list
   	});

   	return html;

}

exports.renderPost = renderPost;
exports.renderIndex = renderIndex;
exports.stripExtname = stripExtname;
exports.eachSource = eachSource;
