// @Author : Ameen Ahmed
// nails.js :
// This file is the main nails script which handles all the tasks like creation of an application and generating
// stuff like controllers, models e.t.c.

var fs = require('fs');
var log = require('./log');
var dbase = require('./scripts/dbase.js');
var util = require('util');
var repl = require('repl');
var colors = require('colors');



function printCreateMessage(title,message) {
	console.log('\t' + title.green+'\t' + message)
}


if(process.argv[2] == 'new') {
	printCreateMessage('create', process.argv[3]);
	fs.mkdirSync(process.cwd() + '/' + process.argv[3]);

	printCreateMessage('create', process.argv[3] + '/app' );
	fs.mkdirSync(process.cwd() + '/' + process.argv[3] + '/app');

	printCreateMessage('create', process.argv[3] + '/config');
	fs.mkdirSync(process.cwd() + '/' + process.argv[3] + '/config');

	printCreateMessage('create', process.argv[3] + '/db');
	fs.mkdirSync(process.cwd() + '/' + process.argv[3] + '/db');

	printCreateMessage('create', process.argv[3] + '/public');
	fs.mkdirSync(process.cwd() + '/' + process.argv[3] + '/public');

	printCreateMessage('create', process.argv[3] + '/app' +'/controllers' );
	fs.mkdirSync(process.cwd() + '/' + process.argv[3] + '/app' +'/controllers');
	
	printCreateMessage('create', process.argv[3] + '/app' +'/helpers' );
	fs.mkdirSync(process.cwd() + '/' + process.argv[3] + '/app' +'/helpers');
	
	printCreateMessage('create', process.argv[3] + '/app/helpers/application_helper.js');
	fs.writeFileSync(process.cwd() +'/' + process.argv[3] + '/app/helpers/application_helper.js',
		'exports.application = {\n\n\n}');
		

	printCreateMessage('create', process.argv[3] + '/app' +'/models' );
	fs.mkdirSync(process.cwd() + '/' + process.argv[3] + '/app' +'/models');

	printCreateMessage('create', process.argv[3] + '/app' +'/views' );
	fs.mkdirSync(process.cwd() + '/' + process.argv[3] + '/app' +'/views');

	printCreateMessage('create', process.argv[3] + '/app' +'/views/layouts' );
	fs.mkdirSync(process.cwd() + '/' + process.argv[3] + '/app' +'/views/layouts' );

	printCreateMessage('create', process.argv[3] + '/app' +'/views/layouts/application.html.ejs' );
	fs.writeFileSync(process.cwd() + '/' + process.argv[3] + '/app' +'/views/layouts/application.html.ejs' ,
			fs.readFileSync(process.env['NAILS_PATH'] + '/resources/layouts/application.html.ejs','utf-8'),
			'utf-8');

	printCreateMessage('create', process.argv[3] + '/config/routes.js');
	fs.writeFileSync(process.cwd() + '/' + process.argv[3] + '/config/routes.js' ,
			fs.readFileSync(process.env['NAILS_PATH'] + '/resources/config/routes.js','utf-8'),
			'utf-8');

	printCreateMessage('create', process.argv[3] + '/config/environment.js');
	fs.writeFileSync(process.cwd() + '/' + process.argv[3] + '/config/environment.js' ,
			fs.readFileSync(process.env['NAILS_PATH'] + '/resources/config/environment.js','utf-8'),
			'utf-8');
	
	printCreateMessage('create', process.argv[3] + '/config/application.js');
	fs.writeFileSync(process.cwd() + '/' + process.argv[3] + '/config/application.js' ,
			fs.readFileSync(process.env['NAILS_PATH'] + '/resources/config/application.js','utf-8'),
			'utf-8');
	
	printCreateMessage('create', process.argv[3] + '/public/404.html');
	fs.writeFileSync(process.cwd() + '/' + process.argv[3] + '/public/404.html' ,
			fs.readFileSync(process.env['NAILS_PATH'] + '/resources/public/404.html','utf-8'),
			'utf-8');


	printCreateMessage('create', process.argv[3] + '/public/403.html');
	fs.writeFileSync(process.cwd() + '/' + process.argv[3] + '/public/403.html' ,
			fs.readFileSync(process.env['NAILS_PATH'] + '/resources/public/403.html','utf-8'),
			'utf-8');


	printCreateMessage('create', process.argv[3] + '/public/index.html');
	fs.writeFileSync(process.cwd() + '/' + process.argv[3] + '/public/index.html' ,
			fs.readFileSync(process.env['NAILS_PATH'] + '/resources/public/index.html','utf-8'),
			'utf-8');

	printCreateMessage('create', process.argv[3] + '/public/js');
	fs.mkdirSync(process.cwd() + '/' + process.argv[3]  +'/public/js' );

	printCreateMessage('create', process.argv[3] + '/public/css');
	fs.mkdirSync(process.cwd() + '/' + process.argv[3]+'/public/css' );

	printCreateMessage('create',process.argv[3] + '/bundle.js');
	fs.writeFileSync(process.cwd()+'/'+process.argv[3] + '/bundle.js','exports.bundle = [\n\n];');

	printCreateMessage('create',process.argv[3] + '/.nails');
	fs.writeFileSync(process.cwd()+'/'+process.argv[3] + '/.nails','//contents still need to be added here');
	
	process.exit(0);
}



if(!fs.existsSync(process.cwd() + '/.nails')) {
	console.log('Not in a nails application folder');
	process.exit(0);
}

if(process.argv[2] == 'server' || process.argv[2] == 's') {
	var server = require(process.env['NAILS_PATH'] + '/scripts/server.js');
	console.log("Server starting...".grey);
	server.start_server();
	var config = require(process.cwd() + '/config/application.js').config;
	var port = '' + config.server.port;
	console.log('Nails 0.1.0 application started on '.grey+'http://localhost:'.green + port.green);
	console.log("Ctrl-C to shutdown the server".grey);
	log.info("Node version : ".grey + process.version.green);
}


if((process.argv[2] == 'generate' || process.argv[2] == 'g') && fs.existsSync(process.cwd() + '/.nails')) {
	if(process.argv[3] == 'controller') {
		printCreateMessage('generate','contoller ' + process.argv[4]);
		if(process.argv[4]) {
			
			printCreateMessage('create','app/controllers/' + process.argv[4] + '_controller.js');
			fs.writeFileSync(process.cwd() + '/app/controllers/' + process.argv[4] + '_controller.js',
				'exports.' + process.argv[4] + ' = {\n\n\n}');
			
			printCreateMessage('create','app/views/' + process.argv[4]);
			fs.mkdirSync(process.cwd() + '/app/views/' + process.argv[4]);
			
			printCreateMessage('create','app/helpers/' + process.argv[4] + '_helper.js');
			fs.writeFileSync(process.cwd() + '/app/helpers/' + process.argv[4] + '_helper.js',
				'exports.' + process.argv[4] + ' = {\n\n\n}');
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
				var modelName = process.argv[4];
				//console.log(params);
				printCreateMessage('create','app/models/' + modelName + '.js');
				
	
				fs.writeFileSync(process.cwd() + '/app/models/' + modelName + '.js','exports.'+modelName +' = {\n\n\n}');
				
				var timestamp = dbase.generateTimestamp();
				printCreateMessage('create','db/migrate/' + timestamp + '_' + modelName + '.js');
			 	
			 	paramsObject = '{';
			 	for(var x in params) {
			 		var obj = params[x].split(':');
			 		if(x!=0) {
			 			paramsObject += ','
			 		}
			 		paramsObject += '\n\t\t\'' + obj[0] + '\' : \'' + obj[1] + '\'';
			 	}
			 	paramsObject += '\n\t}';
			 	
			 	fs.writeFileSync(process.cwd() + '/db/migrate/' + timestamp + '_Create' + modelName + '.js',
			 		'exports.migrate = {\n\n\nup : function() {\n\tthis.createTable(\''+modelName+'\','+paramsObject+');\n\n},\n\n' +
			 		'down : function() {\n\n\tthis.dropTable(\'' + modelName + '\');\n\n}\n\n}','utf-8');
			
			 	var tables = require(process.cwd() + '/db/tables.js').tables;
			 	tables.push(modelName);
			 	var tblStr = 'exports.tables = [';
			 	for(var x in tables) {
			 		if(x != 0) {
			 			tblStr += ','
			 		}
			 		tblStr += '\n\t\'' + tables[x] + '\''; 
			 	}
			 	tblStr += '\n]'
			 	fs.writeFileSync(process.cwd() + '/db/tables.js',tblStr,'utf-8');
				//dbase.createModel(process.argv[4],params);
			} else {
				console.log('Generating a model needs attributes');
			}
		} else {
			console.log('How can i generate the [' + process.argv[3] + '] without a name ?');	
		}
	} else if(process.argv[3] == 'migration') {
		if(process.argv[4]) {
			
			
			var timestamp = dbase.generateTimestamp();
			printCreateMessage('create','db/migrate/' + timestamp + '_' + process.argv[4] + '.js');
			var migration = 'exports.migrate={\nup: function() {\n},\ndown: function(){\n}\n}';
			fs.writeFileSync(process.cwd() + '/db/migrate/' + timestamp + '_' + process.argv[4] + '.js',migration);
		} else {
			console.log('Generating a migration requires a name');
		}
	} else if(process.argv[3] == 'scaffold') {
		if(process.argv[4]) {
			if(process.argv.length >= 6) {
				params = [];
				var len = process.argv.length - 5;
				for(var i=0;i<len;i++) {
					params.push(process.argv[5+i]);
				}
				console.log(params);
				dbase.createModel(process.argv[4],params);
				
				//TODO : inflection to be added
				console.log('Creating the '+process.argv[4]+' controller')
				fs.writeFileSync(process.cwd() + '/app/controllers/' + process.argv[4] + '_controller.js',
				'exports.' + process.argv[4] + ' = {\n\n\n}');
			
				console.log('Creating directory ' + 'app/views/' + process.argv[4]);
				fs.mkdirSync(process.cwd() + '/app/views/' + process.argv[4]);
				console.log('Creatung the ' + process.argv[4] + ' helper');
				fs.writeFileSync(process.cwd() + '/app/helpers/' + process.argv[4] + '_helper.js',
					'exports.' + process.argv[4] + ' = {\n\n\n}');
				
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
	
	printCreateMessage('create','db/' + dbname+'.sqilte');
	printCreateMessage('create','db/tables.js');
	printCreateMessage('create', 'db/migrate');
	
	dbase.create(dbname);
}
function sleep(ms) {
    var fiber = Fiber.current;
    setTimeout(function() {
        fiber.run();
    }, ms);
    Fiber.yield();
}

function addMigrationFunctions(migration) {
	migration.createTable = function(tableName,fields) {

		console.log('\tcreate table '.grey + tableName);
		dbase.createTable(tableName,fields);
		console.log('\tcreate '.green + 'db/' + tableName+'_schema.js');
		dbase.writeSchema(tableName,fields);
	}
	migration.dropTable = function(tableName) {
		console.log('\tdrop table '.grey + tableName);
		dbase.dropTable(tableName);
		console.log('\tremove  '.red + 'db/'  +tableName + '_schema.js');
		fs.unlinkSync(process.cwd() + '/db/'  +tableName + '_schema.js');
	}
	
	migration.renameTable = function(oldName,newName) {
		console.log('\trename table '.grey + oldName + ' to table '.grey + newName);
		dbase.renameTable(oldName,newName);
		var schema = require(process.cwd() + '/db/' + oldName + '_schema.js').schema;
		fs.unlinkSync(process.cwd() + '/db/'  +oldName + '_schema.js');
		console.log('\tcreate '.green + 'db/' + newName+'_schema.js');
		dbase.writeSchema(newName,schema);
	}
	migration.addColumn = function(tableName,columnName,type,options) {
		console.log('\tadd column '.grey + columnName);
		dbase.addColumn(tableName,columnName,type,options);
		var schema = require(process.cwd() + '/db/' + tableName + '_schema.js').schema;
		fs.unlinkSync(process.cwd() + '/db/'  +tableName + '_schema.js');
		schema[columnName] = type;
		console.log('\tmodify '.yellow + 'db/' + tableName+'_schema.js');
		dbase.writeSchema(tableName,schema);
	}
	migration.renameColumn = function(tableName,columnName,newColumnName) {
		console.log('\trename column '.grey + columnName +' to '.grey + newColumnName);
		var newSchema = dbase.renameColumn(tableName,columnName,newColumnName);
		console.log('\tmodify '.yellow + 'db/' + tableName+'_schema.js');
		fs.unlinkSync(process.cwd() + '/db/'  +tableName + '_schema.js');
		dbase.writeSchema(tableName,newSchema);
	}
	migration.changeColumn = function(tableName,columnName,type,options) {
		console.log('\tchange column '.grey + columnName);
		dbase.changeColumn(tableName,columnName,type,options);
		var schema = require(process.cwd() + '/db/' + tableName + '_schema.js').schema;
		console.log('\tmodify '.yellow + 'db/' + tableName+'_schema.js');
		fs.unlinkSync(process.cwd() + '/db/'  +tableName + '_schema.js');
		schema[columnName] = type;
		dbase.writeSchema(tableName,schema);
	}
	migration.removeColumn = function(tableName,columnName) {
		console.log('\tremove column '.grey + columnName);
		var newSchema = dbase.removeColumn(tableName,columnName);
		fs.unlinkSync(process.cwd() + '/db/'  +tableName + '_schema.js');
		console.log('\tmodify '.yellow + 'db/' + tableName+'_schema.js');
		dbase.writeSchema(tableName,newSchema);
	}
}

if(process.argv[2] == 'db:migrate') {
	function migrate() {
		console.log('\tmigrating...'.blue);
		var migrations = fs.readdirSync(process.cwd() + '/db/migrate/');
		timestamps = [];
		currentTimestamp = 0;
		for (var file in migrations) {
			var timestamp = migrations[file].split('_')[0];
			var label = migrations[file].split('_')[1];
			timestamps.push(parseInt(timestamp));
		}
		sort_function = function(a,b) {
			if(a < b) return -1;
			else return 1;
		}
		timestamps.sort(sort_function);	
		
		if(timestamps.length == 0) {
			console.log('\tNo migrations found!'.red);
			return;
		}
	    var fiber = Fiber.current;
		dbase.getCurrentMigrationTimestamp(function(rows) {
			fiber.run(rows);
		});
		var rows = Fiber.yield();
			if(!rows) return;
			var current_timestamp = rows[0]['current_timestamp'];
			
			var new_timestamps = [];
			for(var t in timestamps) {
				
				if(timestamps[t] > current_timestamp) {
					new_timestamps.push(timestamps[t]);
				} 
			}
	
			if(new_timestamps.length == 0) {
				console.log('\tMigrations upto date'.green);
				return;
			}
	
			new_timestamps.sort(sort_function);
			
	
			for(var t in new_timestamps) {
				for(var m in migrations) {
					require('module')._cache={};
					if(migrations[m].match(new_timestamps[t])) {
						var currentMigration = migrations[m];
						
							console.log('\trunning migration '.green + currentMigration.yellow);
							var migration = require(process.cwd() + '/db/migrate/' + currentMigration).migrate;
							addMigrationFunctions(migration);
							migration.up();
						
					}	
						
				}
				
			}
			var latest_timestamp = new_timestamps[new_timestamps.length-1];
			dbase.setCurrentMigrationTimestamp(latest_timestamp,function(){});
		
	}
	
	Fiber(migrate).run();
}

if(process.argv[2] == 'db:rollback') {
	function rollback() {
		console.log('\trolling back...'.blue);
		var migrations = fs.readdirSync(process.cwd() + '/db/migrate/');

		timestamps = [];
		currentTimestamp = 0;
		for (var file in migrations) {
			var timestamp = migrations[file].split('_')[0];
			var label = migrations[file].split('_')[1];
			timestamps.push(parseInt(timestamp));
		}
		sort_function = function(a,b) {
			if(a < b) return -1;
			else return 1;
		}
		timestamps.sort(sort_function);	
		
		if(timestamps.length == 0) {
			console.log('\tNo migrations found!'.red);
			return;
		}
	    var fiber = Fiber.current;
		dbase.getCurrentMigrationTimestamp(function(rows) {
			fiber.run(rows);
		});
		var rows = Fiber.yield();
		if(!rows) return;
		var current_timestamp = rows[0]['current_timestamp'];
		
		var ct = -1;
		for(var i in timestamps) {
			if(timestamps[i] == current_timestamp) {
				ct = i;
			}
		}
		
		if(ct > 0) {
			var new_timestamp = timestamps[ct-1];
		} else if(ct == 0) {
			var new_timestamp = 0;
		} else {
			console.log('\tNothing to rollback'.red);
			return;
		}
		var currentMigration = '';
		for(var key in migrations) {
			if(migrations[key].match(timestamps[ct])) {
				currentMigration = migrations[key];
				break;
			}
		}
		var migration = require(process.cwd() + '/db/migrate/' + currentMigration).migrate;
		addMigrationFunctions(migration);					
		migration.down();
		fiber = Fiber.current;
		dbase.setCurrentMigrationTimestamp(new_timestamp,function(err) {
			fiber.run(err);
		});
		var err = Fiber.yield();
	}
	
	var step = 1;

	if(process.argv[3]) {
		var s = process.argv[3].split('=');
		if(s.length == 2) {
			if(s[0] == 'STEP') {
				step = parseInt(s[1]);
				if(step == 0) {
					step = 1;
				}
			}
		}
	}
	
	Fiber(function() {
		for(var i=0; i<step; i++) {
			rollback();
		
		}
	}).run();
	
	
	
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
	//dbase.setCurrentMigrationTimestamp(0);
	dbase.getRowsFromTable('sqlite_master',function(rows) {
		console.log(rows);
	});
}

if(process.argv[2] == 'console') {
	Fiber(function() {
		var dispatcher = require('./scripts/dispatcher.js');
		var modelClasses = dispatcher.initModels();
		
		
		var vm = require('vm');
		context = {};
		for(var model in modelClasses) {
			context[model] = modelClasses[model];
		}
	 	process.stdin.resume();
	  	process.stdin.setEncoding('utf8');
		
		var fiber = Fiber.current;
	  	process.stdin.on('data', function (text) {
	  		fiber.run(text);
	    		
	  	});
	  	
	  	while(1) {
	  		process.stdin.resume();
	  		util.print('nails$>');
		  	var text = Fiber.yield();
		  	process.stdin.pause();
		    if (text === 'quit') {
		    	done();
		    }
		    processText(text);

		    
	    }
	  	function processText(text) {
	  		console.log(vm.runInNewContext(text,context));
	  	}
	}).run();
	
}

if(process.argv[2] == 'bundle' && process.argv[3] == 'install') {
	var bundle = require(process.cwd() + '/bundle.js').bundle;
	var exec = require('exec-sync');
	var colors = require('colors');
	var file = 'exports.bundle = [';
	function fileAdd(i,file) {
		if(i != 0) {
				file += ',';
			}
		file += '\n\t\'' + bundle[i] + '\'';
		return file;
	}  
	for(var i=0; i < bundle.length; i++) {
		util.print('\t' + bundle[i])
		var str = exec('npm install ' + bundle[i],true);
		if(str.stderr.match('http 200')) {
			console.log('\t intsalled ok'.green);
			file = fileAdd(i,file);
		}
		if(str.stderr.match('http 404')) {
			console.log('\t not found'.red);
		}
		if(str.stderr.match('http 304')) {
			console.log('\t [ok]'.green);
			file = fileAdd(i,file);
		}
		
	}
	file += '\n];'
	fs.writeFileSync(process.cwd() + '/config/bundle.js',file,'utf-8');
} 


