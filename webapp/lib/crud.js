let
	loadSchema,
	checkSchema,
	clearIsOnline,
	checkType,
	constructObj,
	readObj,
	updateObj,
	destroyObj,
	mongodb = require('mongodb'),
	fsHandle = require('fs'),
	JSV = require('JSV').JSV,
	mongoServer = new mongodb.Server('localhost', 27017),
	dbHandle = new mongodb.Db('spa', mongoServer, { safe: true }),
	validator = JSV.createEnvironment(),
	objTypeMap = { 'user': {} };

/****  Utility Methods *****/
loadSchema = (schema_name, schema_path) => {
	fsHandle.readFile(schema_path, 'utf8', (err, data) => {
		objTypeMap[schema_name] = JSON.parse(data);
	});
};

checkSchema = (obj_type, obj_map, callback) => {
	let 
		schema_map = objTypeMap[obj_type],
		report_map = validator.validate(obj_map, schema_map);
	callback(report_map);
};

clearIsOnline = () => {
	updateObj( 'user', {is_online: true}, {is_online: false}, (response_map) => {
		console.log(`All users set to offline ${response_map}`);
	});
}

convertReturnedResult = (result_map) => {
	return result_map.ops[0];
}

/****  Public Methods *****/
//curently user is the only supported object type
checkType = (obj_type) => {
	if(!objTypeMap[obj_type]) {
		return ({
			error_msg: `Object type |${obj_type}| is not supported.`
		})
	}
	return null;
};
constructObj = (obj_type, obj_map, callback) => {
	let
		type_check_map = checkType(obj_type);
	if(type_check_map) {
		callback(type_check_map);
		return;
	}
	checkSchema(obj_type, obj_map, (error_list) => {
		if(error_list.errors.length === 0) {
			dbHandle.collection(obj_type, (outer_error, collection) => {
				let 
					options_map = {safe: true};
				collection.insert(obj_map, options_map, (inner_error, result_map) => {
					callback(convertReturnedResult(result_map));
				})
			})
		} else {
			callback(
			{
				error_msg: 'Input document not valid',
				error_list: error_list
			});
		}
	});
};
readObj = (obj_type, find_map, fields_map, callback) => {
	let 
		type_check_map = checkType(obj_type);
	if(type_check_map) {
		callback(type_check_map);
		return;
	}

	dbHandle.collection(obj_type, (outer_error, collection) => {
		collection.find(find_map, fields_map).toArray((inner_error, map_list) => {
			callback(map_list);
		});
	});
};
updateObj = (obj_type, find_map, set_map, callback) => {
	let 
		type_check_map = checkType(obj_type);
	if(type_check_map) {
		callback(type_check_map);
		return;
	}
	checkSchema(obj_type, set_map, (error_list) => {
		if(error_list.errors.length === 0) {
			dbHandle.collection(obj_type, (outer_error, collection) => {
				collection.update(
					find_map, 
					{$set: set_map}, 
					{safe: true, multi: true, upsert: false}, 
					(inner_error, update_count) => {
						callback({update_count: update_count});
					}
				);
			});
		}
		else {
			callback({
				error_msg: 'Input document not valid',
				error_list: error_list
			});
		}
	});
};
destroyObj = (obj_type, find_map, callback) => {
	let type_check_map = checkType(obj_type);
	if(type_check_map) {
		callback(type_check_map);
		return;
	}

	dbHandle.collection(
		obj_type,
		(outer_error, collection) => {
			let 
				options_map = {safe: true, single: true};
			collection.remove(find_map, options_map, (inner_error, delete_count) => {
				callback({delete_count: delete_count});
			})
		}
	);
};

module.exports = {
	makeMongoId   	: mongodb.ObjectID,
	checkType		: checkType,
	construct		: constructObj,
	read			: readObj,
	update			: updateObj,
	destroy 		: destroyObj
};

/****  Module initialization *****/
dbHandle.open(function() {
	console.log("*** Connected to MongoDB***");
	clearIsOnline();
});
//load schemas into memory (objTypeMap)
(function () {
	let 
		schema_name, schema_path;
	for(schema_name in objTypeMap) {
		if(objTypeMap.hasOwnProperty(schema_name)) {
			schema_path = `${__dirname}/${schema_name}.json`;
			loadSchema(schema_name, schema_path);
		}
	}
})();

console.log("*** CRUD module loaded ***");
