use spa;

db.user.insert({
	"name": "Mike Mikowski",
	"is_online": false,
	"css_map": {
		"top": 100,
		"left": 120,
		"background-color": "rgb(136, 255, 136)"
	}
});

db.user.insert({
	"name": "Mr. Joshua",
	"is_online": false,
	"css_map": {
		"top": 150,
		"left": 120,
		"background-color": "rgb(136, 255, 136)"
	}
});

db.user.insert({
	"name": "Your name here",
	"is_online": false,
	"css_map": {
		"top": 50,
		"left": 120,
		"background-color": "rgb(136, 255, 136)"
	}
});

db.user.insert({
	"name": "Hapless interloper",
	"is_online": false,
	"css_map": {
		"top": 0,
		"left": 120,
		"background-color": "rgb(136, 255, 136)"
	}
});
db.user.find();

db.user.update({
	"_id": ObjectId("57fbf8560369d00046d8ce8c")
}, {
	$set: {
		"name": "Josh Powell"
	}
});

db.user.remove({
	"_id": ObjectId("57fbf84b0369d00046d8ce8a")
});

wget http://localhost:3002/horse/create --header='content-type: application/json' --post-data='{"css_map": {"color": "#ddd"}, "name": "Ed"}'

wget http://localhost:3002/user/create --header='content-type: application/json'