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

/**
 * The chat object API
 * public functions:
 * 		* join() - sets up the chat protocal with backend 
 * 			including publisers for "spa-listchange" and "spa-updateChat" global custom events.
 * 		* set_chatee(person_id) - 
 * 			if the person_id does not exist in the people list, the chatee is set to null
 * 		 	if the person requested is already the chatee, it returns false
 * 		  	it publishes a "spa-setchatee" global custom event.
 * 		* get_chatee() 
 * 			return the person object with who the user is chatting with. 
 * 			if there is no chatee, null is returned.
 * 		* send_msg(msg_text) - send a message to the chatee.
 * 			it publishes a "spa-udpatechat" global cutom event.
 * 			if the user is anonymous or the chatee is null, it aborts and returns false
 * 		* update_avatar(update_avtr_map) - send the update_avtr_map to the backend.
 * 			this results in an "spa-listchange" event 
 * 			which publishes the updated people list and avatar information 
 * 			(the css_map in the person objects).
 * 			THe update_avtr_map must have the form {person_id: person_id, css_map: css_map}
 * global custom events:
 * 		*spa-setchatee
 * 			A map as below is provided as data
 * 			{
 * 				old_chatee: old_chatee_person_object,
 * 				new_chatee: new_chatee_person_object
 * 			}
 * 		*spa-listchange
 * 		*spa-updatechat:  
 * 			this is published when a new message is received or sent.
 * 			if received or sent, A map of the below form is provided as data.
 * 			{
 * 				dest_id: chatee_id,
 * 				dest_name: chatee_name,
 * 				sender_id: sender_id,
 * 				msg_text: message_content
 * 			}
 */
export default class Spa_model {
	constructor() {
		this.configMap = {
			anon_id: 'a0' // reserve a special ID for the "anonymous" person
		};

		this.stateMap = {
			spa_model: null,
			spa_data: null,
			spa_fake: null,
			anon_user: null,
			cid_serial: 0,  // to store a serial number used to create this ID
			people_cid_map: {},
			people_db: TAFFY(),
			user: null,
			is_connected: false // indicate if the user is currently in the chat room
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

		//The people API
		this.people = {
			get_by_cid: (cid) => {return this.stateMap.people_cid_map[cid];},
			get_db: () => {return this.stateMap.people_db;},
			get_user: () => {return this.stateMap.user;},
			login: (name) => {
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

				sio.on('userupdate', this._completeLogin.bind(this));
				//send an adduser message to the backend along with the user details
				sio.emit('adduser', {
					cid: this.stateMap.user.cid,
					css_map: this.stateMap.user.css_map,
					name: this.stateMap.user.name
				});
			},
			logout: () => {
				let 
					is_removed,
					user = this.stateMap.user;

				//a user will automatically exit the chat room once sign-out is complete
				this.chat.leave();
				is_removed = this._removePerson(user);
				this.stateMap.user = this.stateMap.anon_user;

				$.gevent.publish('spa-logout', [user]);
				return is_removed;
			}
		};

		//The chat API
		//since we don't expose all the functions, i use IIFF to keep private methods not exposed
		this.chat =  (() => {
			let 
				_publish_listchange,
				_publish_updatechat,
				_update_list,
				get_chatee,
				send_msg,
				set_chatee,
				leave_chat,
				join_chat,
				chatee = null;
			//to refresh the people object when a new people list is received
			_update_list = (arg_list) => {
				let 
					person_map,
					make_person_map,
					people_list = arg_list[0],
					is_chatee_online = false;
				this._clearPeopleDb();

				for(person_map in people_list) {
					if(people_list.hasOwnProperty(person_map)) {
						if(!person_map.name) {
							return true; // used to skip one iteration
						} 

						//if user defined, update css_map and skip remainder
						if(this.stateMap.user && this.stateMap.user.id === person_map._id) {
							this.stateMap.user.css_map = person_map.css_map; 
							return true;
						}

						make_person_map = {
							cid: person_map._id,
							css_map: person_map.css_map,
							id: person_map._id,
							name: person_map.name
						};

						if(chatee && chatee.id === make_person_map.id) {
							is_chatee_online = true;
						}

						this._makePerson(make_person_map);
					}
				}
				this.stateMap.people_db.sort("name");
				//if chatee is no longer online, we unset the chatee
				//which triggers the 'spa-setchatee' global event
				if(chatee && ! is_chatee_online) {
					set_chatee('');
				}
			};

			_publish_listchange = (arg_list) => {
				_update_list(arg_list);
				$.gevent.publish('spa-listchange', [arg_list]);
			};

			_publish_updatechat = (arg_list) => {
				let 
					msg_map = arg_list[0];
				if(!chatee) {
					set_chatee(msg_map.sender_id);
				} else if(msg_map.sender_id !== this.stateMap.user.id && msg_map.sender_id !== chatee.id) {
					set_chatee(msg_map.sender_id);
				}

				$.gevent.publish('spa-updatechat', [msg_map]);
			};

			get_chatee = () => {
				return chatee;
			};

			send_msg = (msg_text) => {
				let
					msg_map,
					sio = this.isFakeData ? this.stateMap.spa_fake.mockSio : this.stateMap.spa_data.getSio();
				console.log("hello, send_msg");
				if(! sio) {
					return false;
				}
				if(!(this.stateMap.user && chatee)) {
					return false;
				}

				msg_map = {
					dest_id: chatee.id,
					dest_name: chatee.name,
					sender_id: this.stateMap.user.id,
					msg_text: msg_text
				}
				//we published updatechat so we can show our outgoing messages
				_publish_updatechat([msg_map]);
				//??
				sio.emit('udpate', msg_map);
				return true;

			};

			set_chatee = (person_id) => {
				let 
					new_chatee;
				new_chatee = this.stateMap.people_cid_map[person_id];
				if(new_chatee) {
					//if the provided chatee is the same as the current one, it does nothing and returns false
					if(chatee && chatee.id === new_chatee.id) {
						return false;
					}
					//what if chatee does not exit??
				} else {
					new_chatee = null;
				}

				$.gevent.publish('spa-setchatee', {
					old_chatee: chatee,
					new_chatee: new_chatee
				});

				chatee = new_chatee;
				return true;
			}

			leave_chat = () => {
				let 
					sio = this.isFakeData ? this.stateMap.spa_fake.makeSio : this.stateMap.spa_data.getSio();
				chatee = null;
				this.stateMap.is_connected = false;
				if(sio) {
					sio.emit('leavechat');
				}
			};

			join_chat = () => {
				let 
					sio;
				//check if the user has already joined
				if(this.stateMap.is_connected) {
					return false;
				}

				if(this.stateMap.user.get_is_anon(this.stateMap.user)) {
					console.warn('User must be defined before joining chat');
					return false;
				}

				sio = this.isFakeData ? this.stateMap.spa_fake.mockSio : this.stateMap.spa_data.getSio();
				sio.on('listchange', _publish_listchange);
				//bind _publish_updatechat to handle 'updatechat' messages received from the backend.
				//As a result, an 'spa-updatechat' event is published whenever a message is received.
				sio.on('updatechat', _publish_updatechat);
				this.stateMap.is_connected = true;
				return true;
			};

			return {
				leave: leave_chat,
				join: join_chat,
				get_chatee: get_chatee,
				send_msg: send_msg,
				set_chatee: set_chatee
			};
		})();
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
		this.stateMap.spa_model = this;

		if(this.isFakeData) {
			spa_fake = new Spa_fake();
			spa_fake.configModule({spa_model: this.stateMap.spa_model});
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
		// a user will automatically join the chat room once sign-in is complete
		this.chat.join();

		$.gevent.publish('spa-login', [this.stateMap.user]);

	}
	/**
	 * [_makePerson convert a person of Person Object to DB person,
	 * 		and insert the DB person to Spa_data or Spa_fake, 
	 * 			(this.stateMap.people_db.insert(person);)
	 * 		add this newly created person instance into people_cid_map of Spa_model 
	 * 			(this.stateMap.people_cid_map[cid] = person;)
	 * 		DB person (fields): 
	 * 			[
	 * 				name,
	 * 				_id,
	 * 				css_map
	 * 			]
	 * 		person in Model:
	 * 			{
	 * 				cid: DB_person._id,
	 * 				id: DB_person._id,
	 * 				name: DB_person.name,
	 * 				css_map: DB_person.css_map
	 * 			}]
	 * @param  {[type]} person_map [description]
	 * @return {[type]}            [description]
	 */
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