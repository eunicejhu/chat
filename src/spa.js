import Spa_model from "./spa.model";
import Spa_shell from "./spa.shell";
require("../styles/sass/spa.scss");
// require("jquery-touch-events");
require("jquery.event.gevent");
// let $ = require('jquery') obsolete, because plugin is provided in webpack.config.js

class Spa {
	initModule($container) {
		let 
			$t,
			spa_model = new Spa_model(),
			spa_shell = new Spa_shell();
		spa_model.initModule();
		spa_shell.initModule($container);

		// testing sign-in and sign-out using the Javascript console
		$t = $('<div/>');
		$.gevent.subscribe($t, 'spa-login', () => {
			console.log('Hello !', arguments);
		});
		$.gevent.subscribe($t, 'spa-logout', () => {
			console.log('Goodbye !', arguments);
		});

	}
}

$(document).ready(function(){
	let 
		spa = new Spa();
	spa.initModule($('#spa'));
});
