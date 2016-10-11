let
	chatObj,
	socket = require('socket.io'),
	crud = require('./crud');
chatObj = {
	connect: (server) => {
		let 
			io = socket.listen(server);
		//configure Socket.IO not to blacklist or disconnect any other message.
		//Enabling disconnect allows us to be nofified when a licent is dropped using the Socket.IO heartbeat.
		io.set('blacklist', [])
			.of('/chat') //configre Socket.IO to respond to messages in the /chat namespace
			.on('connection', (socket) => {
				socket.on('adduser', () => {});
				socket.on('updatechat', () => {});
				socket.on('leavechat', () => {});
				socket.on('disconnect', () => {});
				socket.on('updateavatar', () => {});
			});

		return io;
	}
};

module.exports = chatObj;