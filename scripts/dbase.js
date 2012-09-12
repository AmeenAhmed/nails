var sqlite = require('sqlite3').verbose();
var fs = require('fs');
var util = require('util');
var Sync = require('sync');

exports.create = function(name) {
	console.log('Creating the file at ' + process.cwd() + '/db/tables.js');
	fs.writeFileSync(process.cwd() + '/db/tables.js','exports.tables = [\n\n\n]','utf-8');
	var db = new sqlite.Database(process.cwd() + '/db/' + name + '.sqlite');
	console.log('Creating the folder ' + process.cwd() + '/db/migrate');
	if(!fs.existsSync(process.cwd() + '/db/migrate'))
		fs.mkdirSync(process.cwd() + '/db/migrate');

	db.run("CREATE TABLE migration (current_timestamp INT);", function(err) {
		if(!err) {
			db.run("INSERT INTO migration VALUES (123);");		
		} else {
			console.log(err);
		}
	});
	
	db.close();
}

exports.getCurrentMigrationTimestamp = function(cb) {
	var name = 'development';
	var db = new sqlite.Database(process.cwd() + '/db/' + name + '.sqlite','OPEN_READWRITE');
	db.all('SELECT * FROM migration;',function(err,rows) {
		cb(rows);
	});
	db.close();
}

exports.getRowsFromTable = function(tableName,cb) {
	var name = 'development';
	var db = new sqlite.Database(process.cwd() + '/db/' + name + '.sqlite','OPEN_READWRITE');
	db.all('SELECT * FROM ' + tableName + ';',function(err,rows) {
		cb(rows);
	});
	db.close();
}

exports.setCurrentMigrationTimestamp = function(ts) {
	var name = 'development';
	var db = new sqlite.Database(process.cwd() + '/db/' + name + '.sqlite','OPEN_READWRITE');

	db.run('DELETE FROM migration;',function() {
		db.run('INSERT INTO migration VALUES (?);',ts);
	});

}

function prefixZero(num) {
	if(num < 10) {
		return "0" + num;
	}
	return num;
}
function generateTimestamp() {
	var date = new Date();
	var month = prefixZero(date.getMonth());
	var dateNum = prefixZero(date.getDate());
	var hours = prefixZero(date.getHours());
	var minutes = prefixZero(date.getMinutes());
	var seconds = prefixZero(date.getSeconds());
	//var milliseconds = prefixZero(date.getMilliseconds());

	return date.getYear() + month + dateNum + hours + minutes + seconds;
}
exports.createModel = function(modelName,params) {
	console.log('Creating the model file at ' + process.cwd() + '/app/models/' + modelName + '.js');
	
	fs.writeFileSync(process.cwd() + '/app/models/' + modelName + '.js','exports.'+modelName +' = {\n\n\n}');
	console.log('Creating the file ' + process.cwd() + '/db/' + modelName+'_schema.js');
	var str = 'exports.schema = {\n\n';
	for(var p=0;p<params.length-1;p++) {
		var attr = params[p].split(':');
		str += '\'' + attr[0] + '\' : \'' + attr[1] + '\',\n';
	}
	var attr = params[params.length-1].split(':');
	str += '\'' + attr[0] + '\' : \'' + attr[1] + '\'';
	
	str += '\n\n}';

	fs.writeFileSync(process.cwd() + '/db/' + modelName+'_schema.js',str,'utf-8');
	var timestamp = generateTimestamp();
 	console.log('Creating the migration ' + process.cwd() + '/db/migrate/' + timestamp + '_' + modelName + '.js');
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
 }


exports.createTable = function(tableName,tableFields) {
	console.log('creating table ' + tableName + 'with ' + util.inspect(tableFields));
	//TODO : create a function for retrieving the current env and place it as name (its hardcoded now)
	var name = 'development';
	var db = new sqlite.Database(process.cwd() + '/db/' + name + '.sqlite','OPEN_READWRITE');
	var fields = 'id INTEGER PRIMARY KEY ASC AUTOINCREMENT';
	for(var f in tableFields) {
		fields += ', ' + f + ' ';
		if(tableFields[f] == 'string') {
			fields += 'TEXT';
		} else if(tableFields[f] == 'integer') {
			fields += 'INT';
		} else if(tableFields[f] == 'float') {
			fields += 'REAL';
		}
	}
	var sql = 'CREATE TABLE ' + tableName +' (' + fields + ');';
	console.log('issuing sql statement ' + sql);

	 db.run(sql, function(err) {
	 
	 	console.log(err);
	 
	 });
	 db.close();
}
function runQuery(sql) {
	var db = new sqlite.Database(process.cwd() + '/db/' + getDbName() + '.sqlite','OPEN_READWRITE');
	db.run(sql, function(err) {
	 	console.log("Error :" + err);
	});
	db.close();	
}
function runQueryGetAll(tableName,point,cb) {

	var db = new sqlite.Database(process.cwd() + '/db/' + getDbName() + '.sqlite','OPEN_READWRITE');
	db.all('SELECT * FROM ' + tableName + ';',function(err,rows) {
	 	if(point) {
	 		if(point == 'first') {
	 			cb(rows[0],tableName);
	 			global.fin = rows[0];
	 		} else if(point == 'last') {
	 			cb(rows[rows.length-1],tableName);

	 		}
	 	} else {
	 		cb(rows,tableName);	
	 	}
	 	global.fin = rows;
	});
	db.close();
}


function runQueryGetWhere(tableName,obj,cb) {
	var db = new sqlite.Database(process.cwd() + '/db/' + getDbName() + '.sqlite','OPEN_READWRITE');

	var where = ' WHERE';
	var i=0;
	for(var o in obj) {
		var x='';
		var and='';
		if(i>0) and ='AND '
		if(typeof obj[o] == 'string') x = '\'';
		where += ' ' + and + o +' = ' + x + obj[o] + x;
		i++;
	}
	
	db.all('SELECT * FROM ' + tableName + where + ';',function(err,rows) {
	 	cb(rows,tableName);
	 	
	});
	db.close();
}

function getDbName() {
	//TODO : Hardcoded to development now. Implement method to find the current environment
	return "development";
}

exports.saveRecord = function(tableName,model) {
	var schema = require(process.cwd() + '/db/' + tableName + '_schema.js').schema;

	var vals = '';
	var attribs = '';
	var i = 0 ;

	for(var prop in schema) {
		var t = '';
		if(i > 0) {
			vals += ',';
			attribs += ',';	
		} 
		if(schema[prop] == 'string') t='\'';
		attribs += prop;
		vals += t + model[prop] + t;
		i++;
	}
	runQuery('INSERT INTO ' + tableName + '('+ attribs +')' + ' VALUES (' + vals + ');');
}

exports.all = function(tableName,cb) {
	
	runQueryGetAll(tableName,null,cb);
}
exports.where = function(tableName,obj,cb) {
	runQueryGetWhere(tableName,obj,cb);
}
exports.deleteRowsWithId = function(tableName,id) {
	runQuery('DELETE FROM ' + tableName + ' WHERE id = ' + id + ';');
}
exports.deleteAll = function(tableName) {
	runQuery('DELETE FROM ' + tableName);
}
exports.findRowsWithId = function(tableName,id,cb) {
	var obj = {};
	obj['id'] = id;
	runQueryGetWhere(tableName,obj,cb);
}
exports.findFirstRow = function(tableName,cb) {
	
	runQueryGetAll(tableName,'first',cb);
}
exports.findLastRow = function(tableName,cb) {
	runQueryGetAll(tableName,'last',cb);
}
exports.deleteRecord = function(tableName,model) {
	exports.deleteRowsWithId(tableName,model.id);
}
exports.updateRecord = function(tableName,model) {

	var schema = require(process.cwd() + '/db/' + tableName + '_schema.js').schema;
	
	var query = ' ';
	var i = 0 ;

	for(var prop in schema) {
		var t = '';
		if(i > 0) {
			query += ','
		} 
		if(schema[prop] == 'string') t='\'';
		
		
		query += prop + ' = ' + t + model[prop] + t;
		i++;
	}
	var where = ' WHERE id=' + model.id; 
	console.log('UPDATE ' + tableName + ' SET ' + query + ';');
	runQuery('UPDATE ' + tableName + ' SET ' + query + where + ';');
}