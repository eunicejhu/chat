import Spa_model from "./spa.model";
import Spa_shell from "./spa.shell";
require("../styles/sass/spa.scss");
require("jquery-touch-events");
require("jquery.event.gevent");
// let $ = require('jquery') obsolete, because plugin is provided in webpack.config.js

class Spa {
	initModule($container) {
		let 
			spa_model = new Spa_model(),
			spa_shell = new Spa_shell();
		spa_model.initModule();
		spa_shell.initModule($container);
	}
}

$(document).ready(function(){
	let 
		spa = new Spa();
	spa.initModule($('#spa'));
});
