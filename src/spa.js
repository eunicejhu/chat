import Spa_shell from "./spa.shell";
require("../styles/sass/spa.scss");
require("jquery.event.ue");
require("jquery.event.gevent");
// let $ = require('jquery') obsolete, because plugin is provided in webpack.config.js

class Spa {
	initModule($container) {
		let 
			spa_model,
			spa_shell = new Spa_shell();
		spa_shell.initModule($container);
		spa_model = spa_shell.stateMap.spa_model;
	}
}

$(document).ready(function(){
	let 
		spa = new Spa();
	spa.initModule($('#spa'));
});
