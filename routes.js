'use strict';
let 
	configRoutes,
	mongodb = require('mongodb'),
	mongoServer,
	dbHandle,
	makeMongoId;
mongoServer = new mongodb.Server('localhost', 27017);
dbHandle = new mongodb.Db('spa', mongoServer, {safe: true});
makeMongoId = mongodb.ObjectID;

configRoutes = (app, server) => {
	app.get('/', (request, response) => {
		response.redirect('src/index.html');
	});

	//interceptor
	app.all('/:obj_type/*?', (request, response, next) => {
		console.log(`${request.params.url} all`);
		response.set('Content-Type', 'application/json');
		next();
	});

	app.get('/:obj_type/list', (request, response) => {
		dbHandle.collection(
			request.params.obj_type,
			(outer_error, collection) => {
				collection.find().toArray(
					(inner_error, map_list) => {
						response.send(map_list);
					}
				);
			}
		);
	});

	app.post('/:obj_type/create', (request, response) => {
		console.log("create, ", request.params.obj_type);
		dbHandle.collection(
			request.params.obj_type,
			(outer_error, collection) => {
				let
					options_map = {safe: true},
					obj_map = request.body;
				collection.insert(
					obj_map,
					options_map,
					(inner_error, result_map) => {
						response.send(result_map);
					}
				);
			}
		);
	});

	app.get('/:obj_type/read/:id', (request, response) => {
		let 
			find_map = {
				_id: makeMongoId(request.params.id)
			};
		dbHandle.collection(
			request.params.obj_type,
			(outer_error, collection) => {
				collection.findOne(
					find_map,
					(inner_error, result_map) => {
						response.send(result_map);
					}
				);
			}
		);
	});

	app.post('/:obj_type/update/:id', (request, response) => {
		let
			find_map = {
				_id: makeMongoId(request.params.id)
			},
			obj_map = request.body;
		dbHandle.collection(
			request.params.obj_type,
			(outer_error, collection) => {
				let
					options_map = {
						"new" : true,
						"upsert": false,
						"safe": true
					};
				//findAndModify is deprecated
				collection.findOneAndUpdate(
					find_map,
					obj_map,
					options_map,
					(inner_error, updated_map) => {
						response.send(updated_map);
					}
				);
			}
		);
	});

	app.get('/:obj_type/delete/:id', (request, response) => {
		let
			find_map = {
				_id: makeMongoId(request.params.id)
			};
		dbHandle.collection(
			request.params.obj_type,
			(outer_error, collection) => {
				let options_map = {
					safe: true,
					single: true
				};
				collection.remove(
					find_map,
					options_map,
					(inner_error, delete_count) => {
						response.send({
							delete_count: delete_count
						});
					}
				);
			}
		);
	});
}

module.exports = {configRoutes: configRoutes};
dbHandle.open(() => {
	console.log('*** Connected to MongoDb ***');
});