let  
	http = require('http'), 
	express = require('express'),
	logger = require('morgan'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	errorhandler = require('errorhandler'),
	serveStatic = require('serve-static'),
	// socketIo = require('socket.io'),
	io,
	app = express(),
	server,
	basicAuth = require('basic-auth'),
	auth,
	routes = require('./lib/routes'),
	watch = require('./watch'),
	countUp,
	countIdx = 0;
server = http.Server(app);
// io = socketIo(server);
//instruct Socket.IO to listen using our HTTP server
auth = (request, response, next) => {
	let user = basicAuth(request);
	if(user === undefined 
		|| user.name !== 'chat'
		|| user.pass !== 'spa') {
		response.statusCode = 401;
	response.setHeader('WWW-Authenticate', 'Basic realm="MyRealName"');
	response.end('Unauthorized');
	} else {
		next();
	}
}

app.set('env', 'development');

//server configurations shared among all env
// app.use(function(request, response, next) {
// 	console.log("ehllo",request.url, request.url.match(/js$/));
// 	if(request.url.match(/js$/) !== null) {
// 		console.log('yesm js');
// 		watch.setWatch(request.url, 'script', io);
// 	} else if(request.url.indexOf('/css/') >= 0) {
// 		watch.setWatch(request.url, 'stylesheet', io);
// 	}
// 	next();
// });
app.use(bodyParser());
app.use(methodOverride());

app.use(serveStatic(__dirname + '/public'));

// app.use(auth);


switch(app.get('env')) {
	case 'development':
		app.use(logger('dev'));
		app.use(errorhandler({
			dumpExceptions: true,
			showStack: true
		}));
		break;
	case 'production':
		console.log('prod');
		app.use(errorhandler());
		break;
	default:
		break;
}
//authentication should be done before routers

//socket.io events

// io.on('connection', (socket) => {
// 	console.log('A user connected');
// });
// countUp = () => {
// 	countIdx++;
// 	io.sockets.send(countIdx);
// }
// setInterval(countUp, 1000);

// countUp = () => {
// 	countIdx ++;
// 	console.log(countIdx);
// 	//send the count to all listening sockets
// 	// io.sockets.send(countIdx);
// }

//routers
routes.configRoutes(app, server);
server.listen(8181);

console.log('Express server listening on port %d in %s mode', server.address().port, app.env);
