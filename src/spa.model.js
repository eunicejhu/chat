import Spa_fake from './spa.fake';
import {taffy as TAFFY} from 'taffydb';

/**
 * The people object API
 * 		* cid
 * 		* name
 * 		* css_map
 * 		* __proto__
 * 			* get_is_user()
 * 			* get_is_anon()
 * -----------------------------------------------------------------
 * 		* get_user() - return the current user person object,
 * 			if the current user is not signed-in, an anonymous person object is returned
 * 		* get_db() - return the TaffDB database of all the person objects, including the current user 
 * 			- presorted
 * 		* get_by_cid() - return a person object with provided unique id
 * 		* login(user_name) - login as the user with the provided user name. 
 * 			The current user object is changed to reflect the new identity. 
 * 			Successful completion of login publishes a 'spa-login' global custom event.
 * 		* logout() - revert the current user object to anonymous.
 * 			The method publishes a 'spa-logout' global custom event.
 */
export default class Spa_model {
	constructor() {
		this.configMap = {
			anon_id: 'a0' // reserve a special ID for the "anonymous" person
		};

		this.stateMap = {
			spa_data: null,
			spa_fake: null,
			anon_user: null,
			cid_serial: 0,  // to store a serial number used to create this ID
			people_cid_map: {},
			people_db: TAFFY(),
			user: null
		};

		this.isFakeData = true;

		this.personProto = {
			get_is_user: (contextUser) => {
				return contextUser.cid === this.stateMap.user.cid
			},
			get_is_anon: (contextUser) => {
				return contextUser.cid === this.stateMap.anon_user.cid;
			}
		};

		this.people = {
			get_by_cid: (cid) => {return this.stateMap.people_cid_map[cid];},
			get_db: () => {return this.stateMap.people_db;},
			get_user: () => {return this.stateMap.user;},
			login: () => {
				let 
					sio = this.isFakeData ? this.stateMap.spa_fake.mockSio : this.stateMap.spa_data.getSio();
				this.stateMap.user = this._makePerson({
					cid: this._makeCid(),
					css_map: {
						top: 25,
						left: 25,
						'background-color': '#8f8'
					},
					name: name
				});

				sio.on('userupdate', this._completeLogin);
				//send an adduser message to the backend along with the user details
				sio.emit('adduser', {
					cid: this.stateMap.user.cid,
					css_map: this.stateMap.user.css_map,
					name: sthis.stateMap.user.name
				});
			},
			logout: () => {
				let 
					is_removed,
					user = this.stateMap.user;
				is_removed = this._removePerson(user);
				this.stateMap.user = this.stateMap.anon_user;

				$.gevent.publish('spa-logout', [user]);
				return is_removed;
			}
		};
	}

	initModule() {
		let 
			spa_fake,
			people_list;
		//initialize anonymous person
		this.stateMap.anon_user = this._makePerson({
			cid: this.configMap.anon_id,
			id: this.configMap.anon_id,
			name: 'anonymous'
		});
		this.stateMap.user = this.stateMap.anon_user;

		if(this.isFakeData) {
			spa_fake = new Spa_fake();
			this.stateMap.spa_fake = spa_fake;
			people_list = spa_fake.getPeopleList();
			people_list.forEach((person_map) => {
				this._makePerson({
					cid: person_map._id,
					css_map: person_map.css_map,
					id: person_map._id,
					name: person_map.name
				});
			});
		}
	}
	/**
	 * [_makeCid a client ID generator.]
	 * @return {[type]} [description]
	 */
	_makeCid() {
		return 'c' + String(this.stateMap.cid_serial++);
	}
	/**
	 * [_clearPeopleDb - to remove all person objects except the anonymous person
	 * 		if a user is signed in, except the current user object]
	 * @return {[type]} [description]
	 */
	_clearPeopleDb() {
		let 
			user = this.stateMap.user;
		this.stateMap.people_db = TAFFY();
		this.stateMap.people_cid_map = {};
		if(user) {
			this.stateMap.people_db.insert(user);
			this.stateMap.people_cid_map[user.cid] = user;
		}
	}
	/**
	 * [_completeLogin to complete user sign-in when the backedn sends confirmation and data for the user
	 * 		updates the current user information
	 * 		publishes the success of the sign-in using 'spa-login' event]
	 * @param  {[type]} user_list [description]
	 * @return {[type]}           [description]
	 */
	_completeLogin(user_list) {
		let 
			user_map = user_list[0];
		delete this.stateMap.people_cid_map[user_map.cid]
		this.stateMap.user.cid = user_map._id;
		this.stateMap.user.id = user_map._id;
		this.stateMap.user.css_map = user_map.css_map;
		this.stateMap.people_cid_map[user_map._id] = this.stateMap.user;

		$.gevent.publish('spa-login', [this.stateMap.user]);

	}

	_makePerson(person_map) {
		let 
			person,
			cid = person_map.cid,
			css_map = person_map.css_map,
			id = person_map.id,
			name = person_map.name;
		if(cid === undefined || !name) {
			throw 'client id and name required';
		}

		person = Object.create(this.personProto);
		person.cid = cid;
		person.name = name;
		person.css_map = css_map;

		if(id) {
			person.id = id;
		}

		this.stateMap.people_cid_map[cid] = person;
		this.stateMap.people_db.insert(person);
		return person;
	}

	_removePerson(person) {
		if(!person) {
			return false;
		}
		// cannot remove anonymous person
		if(person.id == this.configMap.anon_id) {
			return false;
		}

		this.stateMap.people_db({cid: person.cid}).remove();

		if(person.cid) {
			delete this.stateMap.people_cid_map[person.cid]
		}
		return true;
	}
}