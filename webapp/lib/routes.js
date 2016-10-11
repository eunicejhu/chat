'use strict';
let 
	configRoutes,
	crud = require('./crud'),
	chat = require('./chat'),
	makeMongoId = crud.makeMongoId;

configRoutes = (app, server) => {
	app.get('/', (request, response, next) => {
		response.redirect('src/index.html');
		next();
	});

	//interceptor
	app.all('/:obj_type/*?', (request, response, next) => {
		response.set('Content-Type', 'application/json');
		next();
	});

	app.get('/:obj_type/list', (request, response) => {
		crud.read(
			request.params.obj_type,
			{}, {},
			(map_list) => {
				response.send(map_list);
			}
		);
	});

	app.post('/:obj_type/create', (request, response) => {
		crud.construct(
			request.params.obj_type,
			request.body,
			(result_map) => {
				response.send(result_map);
			}
		);
	});

	app.get('/:obj_type/read/:id', (request, response) => {
		crud.read(
			request.params.obj_type,
			{_id: makeMongoId(request.params.id)},
			{},
			(map_list) => {
				response.send(map_list);
			}
		);
	});

	app.post('/:obj_type/update/:id', (request, response) => {
		crud.update(
			request.params.obj_type,
			{_id: makeMongoId(request.params.id)},
			request.body,
			(result_map) => {
				response.send(result_map);
			}

		);
	});

	app.get('/:obj_type/delete/:id', (request, response) => {
		crud.destroy(
			request.params.obj_type,
			{_id: makeMongoId(request.params.id)},
			request.body,
			(result_map) => {
				response.send(result_map);
			}
		);
	});

	chat.connect(server);
}

module.exports = {configRoutes: configRoutes};
