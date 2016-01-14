var express = require('express');
var serveStatic = require('serve-static');

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
       	})

		res.setHeader('Content-Type','text/html;charset=UTF-8');
		res.end(html);
	})

	app.listen(3000);

	console.log("sever is listening on ；http://127.0.0.1:3000/");
}

