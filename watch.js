'use strict';
let
	setWatch,
	fsHandle = require('fs'),
	watchMap = {};
setWatch = (url_path, file_type, io) => {
	let 
		pre_name = './public',
		watch_url = pre_name + url_path;
	console.log(`setWatch on ${url_path}`);

	if(! watchMap[url_path]) {
		console.log(`setting watch on ${url_path}`);

		fsHandle.watchFile(watch_url.slice(2), (current, previous) => {
			console.log('file accessed');
			if(current.mtime !== previous.mtime) {
				console.log('file changed emit,' , file_type);
				io.sockets.emit(file_type, url_path);
			}
		});
		watchMap[url_path] = true;
	}
}

module.exports = { setWatch: setWatch };