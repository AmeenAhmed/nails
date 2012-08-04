// @Author : Ameen Ahmed
// nails.js :
// This file is the main nails script which handles all the tasks like creation of an application and genertaing
// stuff like controllers, models e.t.c.

var fs = require('fs');
var log = require('./log');

if(process.argv.length == 4) {
	if(process.argv[2] == 'new') {
		console.log('Creating directory ' + process.cwd() + '/' + process.argv[3]);
		fs.mkdirSync(process.cwd() + '/' + process.argv[3]);

		console.log('Creating directory ' + process.cwd() + '/' + process.argv[3] + '/app' );
		fs.mkdirSync(process.cwd() + '/' + process.argv[3] + '/app');

		console.log('Creating directory ' + process.cwd() + '/' + process.argv[3] + '/config');
		fs.mkdirSync(process.cwd() + '/' + process.argv[3] + '/config');

		console.log('Creating directory ' + process.cwd() + '/' + process.argv[3] + '/public');
		fs.mkdirSync(process.cwd() + '/' + process.argv[3] + '/public');

		console.log('Creating directory ' + process.cwd() + '/' + process.argv[3] + '/app' +'/controllers' );
		fs.mkdirSync(process.cwd() + '/' + process.argv[3] + '/app' +'/controllers');

		console.log('Creating directory ' + process.cwd() + '/' + process.argv[3] + '/app' +'/models' );
		fs.mkdirSync(process.cwd() + '/' + process.argv[3] + '/app' +'/models');

		console.log('Creating directory ' + process.cwd() + '/' + process.argv[3] + '/app' +'/views' );
		fs.mkdirSync(process.cwd() + '/' + process.argv[3] + '/app' +'/views');

		console.log('Creating directory ' + process.cwd() + '/' + process.argv[3] + '/app' +'/views/layouts' );
		fs.mkdirSync(process.cwd() + '/' + process.argv[3] + '/app' +'/views/layouts' );

		console.log('Creating file ' + process.cwd() + '/' + process.argv[3] + '/app' +'/views/layouts/application.html.ejs' );
		fs.writeFileSync(process.cwd() + '/' + process.argv[3] + '/app' +'/views/layouts/application.html.ejs' ,
				fs.readFileSync(process.env['NAILS_PATH'] + '/resources/layouts/application.html.ejs','utf-8'),
				'utf-8');

		console.log('Creating file ' + process.cwd() + '/' + process.argv[3] + '/config/routes.js');
		fs.writeFileSync(process.cwd() + '/' + process.argv[3] + '/config/routes.js' ,
				fs.readFileSync(process.env['NAILS_PATH'] + '/resources/config/routes.js','utf-8'),
				'utf-8');

		console.log('Creating file ' + process.cwd() + '/' + process.argv[3] + '/public/404.html');
		fs.writeFileSync(process.cwd() + '/' + process.argv[3] + '/public/404.html' ,
				fs.readFileSync(process.env['NAILS_PATH'] + '/resources/public/404.html','utf-8'),
				'utf-8');


		console.log('Creating file ' + process.cwd() + '/' + process.argv[3] + '/public/403.html');
		fs.writeFileSync(process.cwd() + '/' + process.argv[3] + '/public/403.html' ,
				fs.readFileSync(process.env['NAILS_PATH'] + '/resources/public/403.html','utf-8'),
				'utf-8');


		console.log('Creating file ' + process.cwd() + '/' + process.argv[3] + '/public/index.html');
		fs.writeFileSync(process.cwd() + '/' + process.argv[3] + '/public/index.html' ,
				fs.readFileSync(process.env['NAILS_PATH'] + '/resources/public/index.html','utf-8'),
				'utf-8');

		console.log('Creating directory ' + process.cwd() + '/' + process.argv[3] + '/public/js');
		fs.mkdirSync(process.cwd() + '/' + process.argv[3]  +'/public/js' );

		console.log('Creating directory ' + process.cwd() + '/' + process.argv[3] + '/public/css');
		fs.mkdirSync(process.cwd() + '/' + process.argv[3]+'/public/css' );

	}

}

if(process.argv.length == 3) {

	if(process.argv[2] == 'server' || process.argv[2] == 's') {
		var server = require(process.env['NAILS_PATH'] + '/scripts/server.js');
		server.start_server();
		console.log("Server starting...");
		console.log("Nails 0.1.0 application starting in development on http://localhost:3000");
		console.log("Ctrl-C to shutdown the server");
		log.info("Node version : " + process.version);

	}
}

if(process.argv[2] == 'generate') {
	if(process.argv[3]) {
		console.log('U asked me to generate this [' + process.argv[3] + ']');
		if(process.argv[4]) {
			console.log('Creating the '+process.argv[4]+' controller')
			fs.writeFileSync(process.cwd() + '/app/controllers/' + process.argv[4] + '_controller.js',
				'exports.' + process.argv[4] + ' = {\n\n\n}');
			//routes = require(process.cwd() + '/config/routes.js');
			//routes.routes[process.argv[4]] = process.argv[4]
			//console.log(JSON.stringify(routes.routes));
			console.log('Creating directory ' + 'app/views/' + process.argv[4]);
			fs.mkdirSync(process.cwd() + '/app/views/' + process.argv[4]);
		} else {
			console.log('How can i generate the [' + process.argv[3] + '] without a name ?');
		}
	}
}

if(process.argv[2] == 'check') {
	var routes = require(process.env['NAILS_PATH'] + '/resources/config/routes.js');
	var methods = routes.routes['/photos'].via.split('|');
	
	console.log(methods);
}