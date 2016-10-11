let
	emitUserList,
	singIn,
	chatObj,
	socket = require('socket.io'),
	crud = require('./crud'),
	makeMongoId = crud.makeMongoId,
	chatterMap = {};

/**
 * [emitUserList broadcast user list to all connected clients]
 * @type {[type]}
 */
emitUserList = (io) => {
	crud.read(
		'user',
		{is_online: true},
		{},
		(result_list) => {
			io.of('/chat')
				.emit('listchange', result_list);
		}
	);
};

signIn = (io, user_map, socket) => {
	crud.update(
		'user',
		{'_id': user_map.id},
		{is_online: true},
		(result_map) => {
			emitUserList(io);
			user_map.is_online = true;
			socket.emit('userupdate', user_map);
		}
	);

	chatterMap[user_map._id] = socket;
	socket.user_id = user_map._id;
};

chatObj = {
	connect: (server) => {
		console.log("connect on back: ");
		let 
			io = socket.listen(server);
		//configure Socket.IO not to blacklist or disconnect any other message.
		//Enabling disconnect allows us to be nofified when a licent is dropped using the Socket.IO heartbeat.
		io.set('blacklist', [])
			.of('/chat') //configre Socket.IO to respond to messages in the /chat namespace
			.on('connection', (socket) => {
				console.log("a user is connected");
				socket.on('adduser', (user_map) => {
					crud.read(
						'user',
						{name: user_map.name},
						{},
						(result_list) => {
							let
								result_map,
								cid = user_map.cid;
							delete user_map.cid;

							//use existing user with provided name
							if(result_list.length > 0) {
								result_map = result_list[0];
								result_map.cid = cid;
								signIn(io, result_map, socket);
							}
							socket.user_id = user_map._id;
						}
					);
				});
				socket.on('updatechat', (chat_map) => {
					if(chatterMap.hasOwnProperty(chat_map.dest_id)) {
						chatterMap[chat_map.dest_id]
							.emit('updatechat', chat_map);
					}
					else {
						socket.emit('updatechat', {
							sender_id: chat_map.sender_id,
							msg_text: `${chat_map.dest_name} has gone offline.`  
						});
					}
				});
				socket.on('leavechat', () => {});
				socket.on('disconnect', () => {});
				socket.on('updateavatar', () => {});
			});

		return io;
	}
};

module.exports = chatObj;