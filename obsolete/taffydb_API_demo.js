let
	person,
	personCidMap,
	peopleDb,
	peopleList,

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
console.log("get_is_anon", person.get_is_user());
console.log("name : ", person.name);

//check our person_cid_map too
personCidMap = spa_model.people.get_cid_map();
console.log("a0 name: ", personCidMap['a0'].name);