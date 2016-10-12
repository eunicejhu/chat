import Spa_shell from "./spa.shell";
require("../styles/sass/spa.scss");
require("jquery.event.ue");
require("jquery.event.gevent");
// let $ = require('jquery') obsolete, because plugin is provided in webpack.config.js

class Spa {
	initModule($container) {
		let 
			socket,
			spa_model,
			spa_shell = new Spa_shell();
		spa_shell.initModule($container);
		spa_model = spa_shell.stateMap.spa_model;
		// socket = require('socket.io-client')('http://localhost:3002');
		//b is defined in data.js
		spa_shell.jqueryMap.$search.html(b); 
		// socket.connect().on('script', (path) => {
		// 	console.log('script updated');
		// 	// $('#script_a').remove();
		// 	// $('head').append(`<script id="script_a" src="${path}"></script>`)
		// 	// spa_shell.jqueryMap.$search.html(b);
		// });
	}
}

$(document).ready(function(){
	let 
		spa = new Spa();
	spa.initModule($('#spa'));
});
