var express = require('express');
var serveStatic = require('serve-static');
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

module.exports  = function (dir){
	 dir = dir || '.';

	 //初始化express
	var app = express();
	var router = express.Router();
	app.use('/assets',serveStatic(path.resolve(dir,'assets')));
	app.use(router);


	//渲染文章
	router.get('/posts/*', function( req, res, next){
		var name = stripExtname(req.params[0]);
		var file = path.resolve(dir, '_posts', name + '.md');
		fs.readFile(file, function( err, content){
			if(err) return next(err);
			var post = parseSourceContent(content.toString());
			post.content = markdownToHtml(post.source);
			post.layout = post.layout || 'post';
			var html = renderFile(path.resolve(dir, '_layout', post.layout + '.html'),{post: post});
			res.setHeader('Content-Type','text/html;charset=UTF-8');
			res.end(html);
		});
	});

	//渲染列表
	router.get('/',function( req, res, next){
		res.setHeader('Content-Type','text/html;charset=UTF-8');
		res.end('文章列表');
	})

	app.listen(3000);

	console.log("sever is listening on ；http://127.0.0.1:3000/");
}

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