var fse = require('fs-extra');
var path = require('path');
var utils = require('./utils');
var moment = require('moment');

module.exports = function(dir) {
	dir = dir || '.';
	//创建基本目录
	fse.mkdirsSync(path.resolve(dir, '_layout'));
	fse.mkdirsSync(path.resolve(dir, '_posts'));
	fse.mkdirsSync(path.resolve(dir, 'assets'));
	fse.mkdirsSync(path.resolve(dir, 'posts'));

	console.log('begin creat');

	//复制文件
	var tmplDir = path.resolve(__dirname, '../posts');
	fse.copySync(tmplDir, dir);

	//创建文章
	newPost(dir, 'hello,world', '我的第一篇文章');
	console.log('creat ok')

}

function newPost(dir, title, content) {
	var data = [
		'---',
		'',
		'title: ' + title,
		'date: ' + moment().format('YYYY-MM-DD'),
		'',
		'---',
		'',
		content
	].join('\r\n');
	var name = moment().format('YYYY-MM') + 'hello-world.md';
	var file = path.resolve(dir, '_posts', name);
	fse.outputFileSync(file, data);
}