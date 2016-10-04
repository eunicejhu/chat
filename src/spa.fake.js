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
		this.fakeIdSerial = 5;
		this.mockSio = (() => {
			let 
				on_sio,
				emit_sio,
				_send_listchange,
				_listchange_idto,
				_callback_map = {};
			on_sio = (msg_type, callback) => {
				_callback_map[msg_type] = callback;
			}
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
			}
			// try once per second to use listchange callback
			// stop trying after first success
			_send_listchange = () => {
				_listchange_idto = setTimeout(() => {
					if(_callback_map.listchange) {
						_callback_map.listchange([peopleList]);
						_listchange_idto = undefined;
					} else {
						_send_listchange();
					}
				}, 1000);
			}
			//start the process...
			_send_listchange();
			return {
				emit: emit_sio,
				on: on_sio
			}
		})();
	}

	_makeFakeId() {
		return 'id_' + String(this.fakeIdSerial++);
	}

	getPeopleList() {
		return this.peopleList;
	}
}