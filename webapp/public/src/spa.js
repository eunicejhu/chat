import Spa_shell from "./spa.shell";
require("../styles/sass/spa.scss");
require("jquery.event.ue");
require("jquery.event.gevent");
// let $ = require('jquery') obsolete, because plugin is provided in webpack.config.js

class Spa {
	initModule($container) {
		let 
			spa_shell = new Spa_shell();
		spa_shell.initModule($container);
	}
}

$(document).ready(function(){
	let 
		spa = new Spa();
	spa.initModule($('#spa'));
});
