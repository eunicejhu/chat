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
			currentUser,
			peopleDb,
			//--------
			spa_model = new Spa_model(),
			spa_shell = new Spa_shell();
		spa_model.initModule();
		spa_shell.initModule($container);

		// testing sign-in and sign-out using the Javascript console
		$t = $('<div/>');
		$.gevent.subscribe($t, 'spa-login', () => {
			console.log('Hello !', arguments);
		});
		$.gevent.subscribe($t, 'spa-listchange', () => {
			console.log("listchange: ", arguments);
		});
		$.gevent.subscribe($t, 'spa-logout', () => {
			console.log('Goodbye !', arguments);
		});

		//confirm thisis not yet signed-in
		currentUser = spa_model.stateMap.user;
		console.log("get is anon: ", currentUser.get_is_anon(currentUser));

		spa_model.chat.join();
		spa_model.people.login("Fred");

		peopleDb = spa_model.people.get_db();
		peopleDb().each((person) => {
			console.log("person from peopleDb: ", person.name);
		});
		
		spa_model.chat.join();

		peopleDb = spa_model.people.get_db();
		peopleDb().each((person) => {
			console.log("After Fred login, person from peopleDb: ", person.name);
		})

	}
}

$(document).ready(function(){
	let 
		spa = new Spa();
	spa.initModule($('#spa'));
});
