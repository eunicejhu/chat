import Spa_shell from "./spa.shell";
require("../styles/sass/spa.scss");
// let $ = require('jquery') obsolete, because plugin is provided in webpack.config.js

class Spa {
	initModule($container) {
		let 
			spa_shell = new Spa_shell();
		spa_shell.configModule({spa_shell: spa_shell});
		spa_shell.initModule($container);
	}
}

$(document).ready(function(){
	let spa = new Spa();
	spa.initModule($('#spa'));
});
