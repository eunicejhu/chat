import Spa_shell from "./spa.shell";
require("../styles/sass/spa.scss");
require("jquery.event.ue");
require("jquery.event.gevent");
// let $ = require('jquery') obsolete, because plugin is provided in webpack.config.js

class Spa {
	initModule($container) {
		let 
			$t,
			person,
			//--------
			spa_model,
			spa_shell = new Spa_shell();
		spa_shell.initModule($container);
		spa_model = spa_shell.stateMap.spa_model;

		// testing sign-in and sign-out using the Javascript console
		$t = $('<div/>');
		$.gevent.subscribe($t, 'spa-login', (event, user) => {
			console.log('Hello !', user.name);
		});

		$.gevent.subscribe($t, 'spa-updatechat', (event, chat_map) => {
			console.log('Chat message: ', chat_map);
		});

		$.gevent.subscribe($t, 'spa-setchatee', (event, chatee_map) => {
			console.log("Chatee change: ", chatee_map);
		});
		$.gevent.subscribe($t, 'spa-listchange', (event, changed_list) => {
			console.log("listchange: ", changed_list);
		});
		$.gevent.subscribe($t, 'spa-logout', () => {
			console.log('Goodbye !', arguments);
		});

		//confirm thisis not yet signed-in
		// currentUser = spa_model.stateMap.user;
		// console.log("get is anon: ", currentUser.get_is_anon(currentUser));

		// spa_model.chat.join();
		spa_model.people.login("Fanny");
		spa_model.chat.set_chatee('id_03');
		// spa_model.chat.send_msg('Hi Pebbles!');
		// spa_model.chat.send_msg('what is up, tricks?');
		// spa_model.chat.join();

		spa_model.chat.update_avatar({
			person_id: 'id_03',
			css_map: {}
		});

		person = spa_model.people.get_by_cid("id_03");
		console.log("person after change avatar : ", person);


		// peopleDb = spa_model.people.get_db();
		// peopleDb().each((person) => {
		// 	console.log("person from peopleDb: ", person.name);
		// });
		
		// spa_model.chat.join();

		// peopleDb = spa_model.people.get_db();
		// peopleDb().each((person) => {
		// 	console.log("After Fred login, person from peopleDb: ", person.name);
		// })

	}
}

$(document).ready(function(){
	let 
		spa = new Spa();
	spa.initModule($('#spa'));
});
