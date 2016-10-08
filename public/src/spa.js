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
		socket = require('socket.io-client')('http://localhost:3002');
		spa_shell.initModule($container);
		spa_model = spa_shell.stateMap.spa_model;

		socket.connect().on('message', (count) => {
			spa_shell.jqueryMap.$search.html(count);
		});
	}
}

$(document).ready(function(){
	let 
		spa = new Spa();
	spa.initModule($('#spa'));
});
