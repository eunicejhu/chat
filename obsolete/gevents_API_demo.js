//let 
// $listbox,
// onListChange,
// $('body').append('<div id="spa-chat-list-box"></div>');
	// $listbox = $('#spa-chat-list-box');
	// $listbox.css({
	// 	position: 'absolute',
	// 	'z-index': 3,
	// 	top: 50,
	// 	left: 50,
	// 	width: 50,
	// 	height: 50,
	// 	border: '2px solid black',
	// 	backgroud: '#fff'
	// });

	// onListChange = (event, update_map) => {
	// 	alert('onListChange ran');
	// 	$listbox.html(update_map.list_text);
	// }

	// $.gevent.subscribe(
	// 	$listbox,
	// 	'spa-listchange',
	// 	onListChange
	// );

	// $.gevent.publish(
	// 	'spa-listchange',
	// 	[{list_text: 'the list is here'}]
	// );

	// $listbox.remove();
	// $.gevent.publish('spa-change', [{}]);
// testing sign-in and sign-out using the Javascript console
		// $t = $('<div/>');
		// $.gevent.subscribe($t, 'spa-login', (event, user) => {
		// 	console.log('Hello !', user.name);
		// });

		// $.gevent.subscribe($t, 'spa-updatechat', (event, chat_map) => {
		// 	console.log('Chat message: ', chat_map);
		// });

		// $.gevent.subscribe($t, 'spa-setchatee', (event, chatee_map) => {
		// 	console.log("Chatee change: ", chatee_map);
		// });
		// $.gevent.subscribe($t, 'spa-listchange', (event, changed_list) => {
		// 	console.log("listchange: ", changed_list);
		// });
		// $.gevent.subscribe($t, 'spa-logout', () => {
		// 	console.log('Goodbye !', arguments);
		// });

		//confirm thisis not yet signed-in
		// currentUser = spa_model.stateMap.user;
		// console.log("get is anon: ", currentUser.get_is_anon(currentUser));

		// spa_model.chat.join();
		// spa_model.people.login("Fanny");
		// spa_model.chat.set_chatee('id_03');
		// spa_model.chat.send_msg('Hi Pebbles!');
		// spa_model.chat.send_msg('what is up, tricks?');
		// spa_model.chat.join();

		// spa_model.chat.update_avatar({
		// 	person_id: 'id_03',
		// 	css_map: {}
		// });

		// person = spa_model.people.get_by_cid("id_03");
		// console.log("person after change avatar : ", person);


		// peopleDb = spa_model.people.get_db();
		// peopleDb().each((person) => {
		// 	console.log("person from peopleDb: ", person.name);
		// });
		
		// spa_model.chat.join();

		// peopleDb = spa_model.people.get_db();
		// peopleDb().each((person) => {
		// 	console.log("After Fred login, person from peopleDb: ", person.name);
		// })