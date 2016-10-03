import Spa_fake from './spa.fake';
import {taffy as TAFFY} from 'taffydb';

export default class Spa_model {
	constructor() {
		this.configMap = {
			anon_id: 'a0' // reserve a special ID for the "anonymous" person
		};

		this.stateMap = {
			anon_user: null,
			people_cid_map: {},
			people_db: TAFFY()
		};

		this.isFakeData = true;

		this.personProto = {
			get_is_user: () => {console.log("output this: ", this); return this.cid === this.stateMap.user.cid},
			get_is_anon: () => {return this.cid === this.stateMap.anon_user.cid}
		};

		this.people = {
			get_db: () => {return this.stateMap.people_db;},
			get_cid_map: () => {return this.stateMap.people_cid_map;}
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
			people_list = spa_fake.getPeopleList();
			people_list.forEach((person_map, i) => {
				this._makePerson({
					cid: person_map._id,
					css_map: person_map.css_map,
					id: person_map._id,
					name: person_map.name
				});
			});
		}
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
}