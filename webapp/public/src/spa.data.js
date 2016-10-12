// import socketIo from 'socket.io-client';
export default class Spa_data {
	constructor(props) {
		this.stateMap = {sio: null};
	}

	makeSio() {
		let 
			socket = io('http://192.34.57.50/chat');

		return {
			emit: (event_name, data) => {
				console.log("try to create socket, data ", data);
				socket.emit(event_name, data);
			},
			on: (event_name, callback) => {
				socket.on(event_name, (data) => {
					callback(data);
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