export default class Spa_data {
	constructor(props) {
		this.stateMap = {sio: null};
		this.io = require('socket.io-client')('http://localhost:3002');
	}

	makeSio() {
		let 
			socket = this.io.connect("/chat");
		console.log("try to create socket, ", socket);
		return {
			emit: (event_name, data) => {
				socket.emit(event_name, data);
			},
			on: (event_name, callback) => {
				socket.on(event_name, () => {
					callback(arguments);
				})
			}
		};
	}

	getSio() {
		if(! this.stateMap.sio) {
			this.stateMap.sio = this.makeSio();
		}

		return this.stateMap.sio;
	}

	initModule() {

	}
}