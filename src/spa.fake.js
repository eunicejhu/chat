import Spa_util from "./spa.util";
export default class Spa_fake {
	constructor() {
		this.peopleList = [
			{
				name: 'Betty',
				_id: 'id_01', // id - the unique id. this may be undefined if the object is not synced with backend
				css_map: {  // a map of attributes used for avatar presentation
					top: 20,
					left: 20,
					'background-color': 'rgb(128, 128, 128)'
				}
			},
			{
				name: 'Mike',
				_id: 'id_02',
				css_map: {
					top: 60,
					left: 20,
					'background-color': 'rgb(128, 255, 128)'
				}
			},
			{
				name: 'Pebbles',
				_id: 'id_03',
				css_map: {
					top: 100,
					left: 20,
					'background-color': 'rgb(128, 192, 190)'
				}
			},
			{
				name: 'Wilma',
				_id: 'id_04',
				css_map: {
					top: 140,
					left: 20,
					'background-color': 'rgb(192, 128, 128)'
				}
			}
		];
		this.configMap = {
			settable_map: {
				spa_model: true
			}
		};
		this.stateMap = {
			spa_model: null
		}
		this.fakeIdSerial = 5;
		this.mockSio = (() => {
			let 
				on_sio,
				emit_sio,
				_emit_mock_msg,
				_send_listchange,
				_listchange_idto,
				_callback_map = {};
			on_sio = (msg_type, callback) => {
				_callback_map[msg_type] = callback;
			};
			emit_sio = (msg_type, data) => {
				let 
					person_map;
				//when the user signs in, it will push the user definition into the mock people list
				if(msg_type === 'adduser' && _callback_map.userupdate) {
					setTimeout(() => {
						person_map = {
							_id: this._makeFakeId(),
							name: data.name,
							css_map: data.css_map
						};

						this.peopleList.push(person_map);
						_callback_map.userupdate([person_map]);
					}, 3000);
				}

				//respond to 'updatechat' event with an 'updatechat'
				//callback after a 2s delay, Echo back user info
				if(msg_type === "updatechat" && _callback_map.updatechat) {
					setTimeout(() => {
						let
							user = this.stateMap.spa_model.people.get_user();
						_callback_map.updatechat([{
							dest_id: user.id,
							dest_name: user.name,
							sender_id: data.dest_id,
							msg_text: `Thanks for the note, ${user.name}`
						}]);
					}, 2000);
				}

				if(msg_type === 'leavechat') {
					//reset login status
					delete _callback_map.listchange;
					delete _callback_map.updatechat;

					if(_listchange_idto) {
						clearTimeout(_listchange_idto);
						_listchange_idto = undefined;
					}

					_send_listchange();
				}

				//create a handler for receipt of an updateavatar message.
				if(msg_type === 'updateavatar' && _callback_map.listchange) {
					//stimuate receipt of 'listchange' message
					this.peopleList.forEach(function(person_map){
						if(person_map._id === data.person_id) {
							person_map.css_map = data.css_map;
							return false; //jump out of the iteration completely
						}
					});
					//execute callback for the 'listchange' message
					_callback_map.listchange([this.peopleList]);
				}
			};

			// try send a mock message to the signed-in user once every 8 seconds. 
			// This will succeed only after a user is signed in when the updatechat callback is set.
			// On success, the routine does not call itself again 
			// and therefore no further attempts to send a mock message will be made
			_emit_mock_msg = () => {
				setTimeout(() => {
					let 
						user;
					user =  this.stateMap.spa_model.people.get_user();
					if(_callback_map.updatechat) {
						_callback_map.updatechat([{
							dest_id: user.id,
							dest_name: user.name,
							sender_id: 'id_04',
							msg_text: `Hi there ${user.name}! Wilma here.` 
						}]);
					} else {
						_emit_mock_msg();
					}
				}, 8000);
			}
			// try once per second to use listchange callback
			// stop trying after first success
			_send_listchange = () => {
				_listchange_idto = setTimeout(() => {
					if(_callback_map.listchange) {
						_callback_map.listchange([this.peopleList]);
						// trying to send a mock message after the user signs in
						_emit_mock_msg();
						_listchange_idto = undefined;
					} else {
						_send_listchange();
					}
				}, 1000);
			};

			//start the process...
			// _send_listchange();

			return {
				emit: emit_sio,
				on: on_sio
			}
		})();
	}

	configModule(input_map) {
		Spa_util.setStateMap({
			input_map: input_map,
			settable_map: this.configMap.settable_map,
			state_map: this.stateMap
		});
		return true;
	}

	_makeFakeId() {
		return 'id_' + String(this.fakeIdSerial++);
	}

	getPeopleList() {
		return this.peopleList;
	}
}