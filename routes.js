'use strict';
let 
	configRoutes,
	mongodb = require('mongodb'),
	mongoServer,
	dbHandle;
mongoServer = new mongodb.Server('localhost', 27017);
dbHandle = new mongodb.Db('spa', mongoServer, {safe: true});
dbHandle.open(() => {
	console.log('*** Connected to MongoDb ***');
});

configRoutes = (app, server) => {
	app.get('/', (request, response) => {
		response.redirect('src/index.html');
	});

	//interceptor
	app.all('/user/*?', (request, response, next) => {
		response.set('Content-Type', 'application/json');
		next();
	});

	app.get('/:obj_type/list', (request, response) => {
		response.send({
			title: `${request.params.obj_type} list`
		});
	});

	app.post('/:obj_type/create', (request, response) => {
		response.send({
			title: `${request.params.obj_type} created`
		});
	});

	app.get('/:obj_type/read/:id([0-9]+)', (request, response) => {
		response.send({
			title: `${request.params.obj_type} with id ${request.params.id} Found`
		})
	});

	app.post('/:obj_type/update/:id([0-9]+)', (request, response) => {
		response.send({
			title: `${request.params.obj_type} with id ${request.params.id} updated`
		})
	});

	app.get('/:obj_type/delete/:id([0-9]+)', (request, response) => {
		response.send({
			title: `${request.params.obj_type} with id ${request.params.id} deleted`
		})
	});
}

module.exports = {configRoutes: configRoutes};