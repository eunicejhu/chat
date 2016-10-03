import Spa_model from "./spa.model";
import Spa_shell from "./spa.shell";
require("../styles/sass/spa.scss");
require("jquery-touch-events");
require("jquery.event.gevent");
// let $ = require('jquery') obsolete, because plugin is provided in webpack.config.js

class Spa {
	initModule($container) {
		let 
			person,
			personCidMap,
			peopleDb,
			peopleList,
			//------fake above
			spa_model = new Spa_model(),
			spa_shell = new Spa_shell();
		spa_model.initModule();
		spa_shell.initModule($container);

		//playing with fake people
		peopleDb = spa_model.people.get_db();
		//remark: use the TaffyDB get() to extract an array from the collection
		peopleList = peopleDb().get();

		peopleDb().each((person) => {
			console.log(person.name);
		})

		//get the person with id of 'id_03'
		person = peopleDb({cid: 'id_03'}).first();

		//inspect the css_map attribute
		JSON.stringify(person.css_map);

		//try an inherited method
		console.log("get_is_anon", person.get_is_anon());
		console.log("name : ", person.name);

		//check our person_cid_map too
		personCidMap = spa_model.people.get_cid_map();
		console.log("a0 name: ", personCidMap['a0'].name);
	}
}

$(document).ready(function(){
	let 
		spa = new Spa();
	spa.initModule($('#spa'));

	
});
