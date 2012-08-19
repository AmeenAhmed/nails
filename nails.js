// @Author : Ameen Ahmed
// nails.js :
// This file is the main nails script which handles all the tasks like creation of an application and genertaing
// stuff like controllers, models e.t.c.

var fs = require('fs');
var log = require('./log');
var dbase = require('./scripts/dbase.js');

if(process.argv.length == 4) {
	if(process.argv[2] == 'new') {
		console.log('Creating directory ' + process.cwd() + '/' + process.argv[3]);
		fs.mkdirSync(process.cwd() + '/' + process.argv[3]);

		console.log('Creating directory ' + process.cwd() + '/' + process.argv[3] + '/app' );
		fs.mkdirSync(process.cwd() + '/' + process.argv[3] + '/app');

		console.log('Creating directory ' + process.cwd() + '/' + process.argv[3] + '/config');
		fs.mkdirSync(process.cwd() + '/' + process.argv[3] + '/config');

		console.log('Creating directory ' + process.cwd() + '/' + process.argv[3] + '/db');
		fs.mkdirSync(process.cwd() + '/' + process.argv[3] + '/db');

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

		console.log('Creating file ' + process.cwd() + '/' + process.argv[3] + '/config/environment.js');
		fs.writeFileSync(process.cwd() + '/' + process.argv[3] + '/config/environment.js' ,
				fs.readFileSync(process.env['NAILS_PATH'] + '/resources/config/environment.js','utf-8'),
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

		console.log('Creating file ' + process.cwd()+'/'+process.argv[3] + '/nmake.js');
		fs.writeFileSync(process.cwd()+'/'+process.argv[3] + '/nmake.js','//contents still need to be added here');

	}

}

if(!fs.existsSync(process.cwd() + '/nmake.js')) {
	console.log('Not in a nails application folder');
	process.exit(0);
}
	if(process.argv[2] == 'server' || process.argv[2] == 's') {
		var server = require(process.env['NAILS_PATH'] + '/scripts/server.js');
		server.start_server();
		console.log("Server starting...");
		console.log("Nails 0.1.0 application starting in development on http://localhost:3000");
		console.log("Ctrl-C to shutdown the server");
		log.info("Node version : " + process.version);

	}


if(process.argv[2] == 'generate' && fs.existsSync(process.cwd() + '/nmake.js')) {
	if(process.argv[3] == 'controller') {
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
	} else if(process.argv[3] == 'model') {
		if(process.argv[4]) {
			if(process.argv.length >= 6) {
				params = [];
				var len = process.argv.length - 5;
				for(var i=0;i<len;i++) {
					params.push(process.argv[5+i]);
				}
				console.log(params);
				dbase.createModel(process.argv[4],params);
			} else {
				console.log('Generating a model needs attributes');
			}
		} else {
			console.log('How can i generate the [' + process.argv[3] + '] without a name ?');	
		}
	}
}

if(process.argv[2] == 'db:create') {
	var environment_file = require(process.cwd() + '/config/environment.js');
	var dbname = environment_file.environment;
	console.log("Creating a database in " + dbname + ' environment');
	dbase.create(dbname);
}



if(process.argv[2] == 'env') {
	var environment_file = require(process.cwd() + '/config/environment.js');
	var env = environment_file.environment;

	if(!process.argv[3]) {
		console.log('current environment [' + env + ']');
		return;
	}

	
	var dev = 'exports.environment = \'development\';';
	var test = 'exports.environment = \'test\';';
	var prod = 'exports.environment = \'production\';';
	var file = process.cwd() + '/config/environment.js';
	if(process.argv[3] == 'production') {
		if(env == 'production') {
			console.log('You are already in production');
		} else {
			fs.unlink(process.cwd() + '/config/environment.js');
			fs.writeFileSync(file,prod+'\n\n'+'//'+test+'\n//'+dev,'utf-8');
		}
	} else if(process.argv[3] == 'test') {
		if(env == 'test') {
			console.log('You are already in test');
		} else {
			fs.unlink(process.cwd() + '/config/environment.js');	
			fs.writeFileSync(file,test+'\n\n'+'//'+prod+'\n//'+dev,'utf-8');
		}

	} else if(process.argv[3] == 'development') {
		if(env == 'development') {
			console.log('You are already in development');
		} else {
			fs.unlink(process.cwd() + '/config/environment.js');
			fs.writeFileSync(file,dev+'\n\n'+'//'+test+'\n//'+prod,'utf-8');
		}
	} else {
		console.log('Wrong development environment [' + process.argv[3]+']');
	}
}

if(process.argv[2] == 'check') {
	var routes = require(process.env['NAILS_PATH'] + '/resources/config/routes.js');
	var methods = routes.routes['/photos'].via.split('|');
	
	console.log(methods);
}