let
	emitUserList,
	signIn,
	signOut,
	chatObj,
	socketIo = require('socket.io'),
	crud = require('./crud'),
	makeMongoId = crud.makeMongoId,
	chatterMap = {};

/**
 * [emitUserList broadcast user list to all connected clients]
 * @type {[type]}
 */
emitUserList = (io) => {
	console.log("7");
	crud.read(
		'user',
		{is_online: true},
		{},
		(result_list) => {
			console.log('listchange ', result_list);
			io.of('/chat')
			  .emit('listchange', result_list);
		}
	);
};

signIn = (io, user_map, socket) => {
	console.log("6");
	crud.update(
		'user',
		{'_id': user_map._id},
		{is_online: true},
		(result_map) => {
			emitUserList(io);
			user_map.is_online = true;
			socket.emit('userupdate', [user_map]);
		}
	);

	chatterMap[user_map._id] = socket;
	socket.user_id = user_map._id;
};

signOut = (io, user_id) => {
	console.log('signOut 1', user_id);
	crud.update(
		'user',
		{'_id': user_id},
		{'is_online': false},
		(result_list) => {
			console.log('signOut 2');
			emitUserList(io);
		}
	);

	delete chatterMap[user_id];
}

chatObj = {
	connect: (server) => {
		let 
			io = socketIo(server);
		//configure Socket.IO not to blacklist or disconnect any other message.
		//Enabling disconnect allows us to be nofified when a licent is dropped using the Socket.IO heartbeat.
		io.of('/chat')
		  .on("connection", (socket) => {
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
							console.log("result_list: ", result_list);
							//use existing user with provided name
							if(result_list.length > 0) {
								result_map = result_list[0];
								result_map.cid = cid;
								signIn(io, result_map, socket);
							}
							else {
								crud.construct(
									'user',
									user_map,
									(result_map) => {
										if(result_map.error_msg === undefined) {
											result_map.cid = cid;
											console.log("result_map before signIn: ", result_map);
											signIn(io, result_map, socket);
										}
									}
								);
							}
							
						}
					);
					socket.user_id = user_map._id;
				});
			socket.on('updatechat', (chat_map) => {
				console.log("updatechat chat_map: ", chat_map);
				if(chatterMap.hasOwnProperty(chat_map.dest_id)) {
					console.log('has alrady 1');
					chatterMap[chat_map.dest_id]
						.emit('updatechat', chat_map);
				}
				else {
					console.log('Not yet 2');
					socket.emit('updatechat', {
						sender_id: chat_map.sender_id,
						msg_text: `${chat_map.dest_name} has gone offline.`  
					});
				}
			});
			// click on username in the top-right corner of the browser window to sign out
			socket.on('leavechat', () => {
				console.log(`** user ${socket.user_id} logged out **`);
				socket.removeAllListeners('updatechat');
				signOut(io, socket.user_id);
			});
			// close the browser window
			socket.on('disconnect', () => {
				console.log(`** user ${socket.user_id} closed browser window or tab **`);
				socket.removeAllListeners('updatechat');
				signOut(io, socket.user_id);
			});
			socket.on('updateavatar', () => {});
		});
		return io;
	}
};

module.exports = chatObj;