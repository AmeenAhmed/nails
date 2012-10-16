var sqlite = require('sqlite3').verbose();
var fs = require('fs');
var util = require('util');
var Fiber = require('fibers');

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
exports.generateTimestamp = generateTimestamp;

exports.writeSchema = function(tableName,params) {
	console.log('Creating the file ' + process.cwd() + '/db/' + tableName+'_schema.js');
	var str = 'exports.schema = {\n\n';
	var start = false;
	for(var key in params) {
		if(!start) {
			start = true;
		} else {
			str += ',\n'
		}
		str += '\t' + key + ':\'' + params[key] + '\'';
	}	
	str += '\n\n}';
    
	fs.writeFileSync(process.cwd() + '/db/' + tableName+'_schema.js',str,'utf-8');
	console.log('****************************************************************');
	console.log('STR : ' + str);
	console.log('****************************************************************');
}
exports.createModel = function(modelName,params) {
	console.log('Creating the model file at ' + process.cwd() + '/app/models/' + modelName + '.js');
	
	fs.writeFileSync(process.cwd() + '/app/models/' + modelName + '.js','exports.'+modelName +' = {\n\n\n}');
	
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
 	//fs.mkdirSync(process.cwd() + '/db/migrate');
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

	
	var r = runQuery(sql);
	if(r) {
		console.log("Create Table error : " + r);	
	} else {
		console.log('Create table successfull!');
	}
}

exports.dropTable = function(tableName) {
	
	var sql = 'DROP TABLE ' + tableName + ';';
	console.log('issuing sql statement ' + sql);
	
	runQuery(sql);
}

exports.renameTable = function(oldName,newName) {
	var sql = 'ALTER TABLE ' + oldName + ' RENAME TO ' + newName + ';';
	console.log('issuing sql statement ' + sql);
	runQuery(sql);

}
exports.addColumn = function(tableName,columnName,type,options) {
	var sqlType = '';
	if(type == 'string') {
		sqlType = 'TEXT';
	} else if(type == 'integer') {
		sqlType = 'INT';
	} else if(type == 'float') {
		sqlType = 'REAL';
	}
	var sql = 'ALTER TABLE ' + tableName + ' ADD COLUMN ' + columnName + ' ' + sqlType + ';';
	console.log('issuing sql statement ' + sql);

	runQuery(sql);

}
exports.renameColumn = function(tableName,columnName,newColumnName) {

	
	var sql = 'ALTER TABLE ' + tableName + ' RENAME TO ' + tableName + '_temp;';
	console.log('issuing sql statement ' + sql);
	
	runQuery(sql);
	
 	var schema = require(process.cwd() + '/db/' + tableName + '_schema.js').schema;
	console.log('Old schema : ' + util.inspect(schema));
	var new_schema = {};
	
	for(var key in schema) {
		if(key == columnName) {
			new_schema[newColumnName] = schema[columnName];
		} else {
			new_schema[key] = schema[key];
		}
	}
		
	var fields = 'id INTEGER PRIMARY KEY ASC AUTOINCREMENT';
	tableFields = new_schema;
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
	sql = 'CREATE TABLE ' + tableName +' (' + fields + ');';
	console.log('issuing sql statement ' + sql);
	
	runQuery(sql);
		 	
	var new_keys = '';
	var old_keys = '';
	for(var key in new_schema) {
		if(new_keys != '') {
			new_keys +=',';
		} 
		new_keys += key;
	}
	for(var key in schema) {
		if(old_keys != '') {
			old_keys +=',';
		} 
		old_keys += key;
	}
	sql = 'INSERT INTO tableName('+new_keys+') SELECT ' + old_keys + ' FROM temp_' + tableName; 
		

	runQuery(sql);
	
	var sql = 'DROP TABLE ' + tableName + '_temp;';
	console.log('issuing sql statement ' + sql);
	
	runQuery(sql);
	return new_schema;
}
exports.changeColumn = function(tableName,columnName,type,options) {
	this.renameTable(tableName,'temp_' + tableName);
	var schema = require(process.cwd() + '/db/' + tableName + '_schema.js').schema;
	console.log('Schema in change column : ' + util.inspect(schema));
	var new_schema = schema;
	new_schema[columnName] = type;
	
	this.createTable(tableName, new_schema);
	var new_keys = '';
	var old_keys = '';
 	for(var key in new_schema) {
 		if(new_keys != '') {
 			new_keys +=',';
 		} 
 		new_keys += key;
 	}
 	for(var key in schema) {
 		if(old_keys != '') {
 			old_keys +=',';
 		} 
 		old_keys += key;
 	}
	sql = 'INSERT INTO tableName('+new_keys+') SELECT ' + old_keys + ' FROM temp_' + tableName; 
	runQuery(sql);
	
	this.dropTable('temp_'+tableName);
	 
	
}
exports.removeColumn = function(tableName,columnName) {
	this.renameTable(tableName,'temp_' + tableName);
	var schema = require(process.cwd() + '/db/' + tableName + '_schema.js').schema;
	var new_schema = {};
	
	for(var key in schema) {
		if(key != columnName) {
			new_schema[key] = schema[key];
		}
	}
	
	this.createTable(tableName, new_schema);
	var new_keys = '';
	var old_keys = '';
 	for(var key in new_schema) {
 		if(new_keys != '') {
 			new_keys +=',';
 		} 
 		new_keys += key;
 	}
 	for(var key in schema) {
 		if(old_keys != '') {
 			old_keys +=',';
 		} 
 		old_keys += key;
 	}
	sql = 'INSERT INTO tableName('+new_keys+') SELECT ' + old_keys + ' FROM temp_' + tableName; 
	runQuery(sql);
	
	this.dropTable('temp_'+tableName);
	 
	return new_schema;
}
function runQuery(sql) {
	var db = new sqlite.Database(process.cwd() + '/db/' + getDbName() + '.sqlite','OPEN_READWRITE');
	var fiber = Fiber.current;
	db.run(sql, function(err) {
	 	
	 	fiber.run(err);
	});
	var r = Fiber.yield();
	db.close();	
	return r;
}
function runQueryGetAll(tableName,point,cb) {

	var db = new sqlite.Database(process.cwd() + '/db/' + getDbName() + '.sqlite','OPEN_READWRITE');
	
	var fiber = Fiber.current;
	db.all('SELECT * FROM ' + tableName + ';',function(err,rows) {
	 	if(point) {
	 		if(point == 'first') {
	 			//cb(rows[0],tableName);
	 			fiber.run(rows[0])
	 			
	 		} else if(point == 'last') {
	 			//cb(rows[rows.length-1],tableName);
	 			fiber.run(rows[rows.length-1]);

	 		}
	 	} else {
	 		//cb(rows,tableName);
	 		fiber.run(rows);	
	 	}
	 	
	});
	var r = Fiber.yield();
	db.close();
	return r;
}


function runQueryGetWhere(tableName,obj,cb) {
	var db = new sqlite.Database(process.cwd() + '/db/' + getDbName() + '.sqlite','OPEN_READWRITE');
	console.log(obj);
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
	var fiber = Fiber.current;
	console.log('SELECT * FROM ' + tableName + where + ';');
	db.all('SELECT * FROM ' + tableName + where + ';',function(err,rows) {
	 	//cb(rows,tableName);
	 	fiber.run(rows);
	 	
	});
	var r = Fiber.yield();
	db.close();
	return r;
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

exports.all = function(tableName) {
	
	return runQueryGetAll(tableName,null);
}
exports.where = function(tableName,obj) {
	return runQueryGetWhere(tableName,obj);
}
exports.deleteRowsWithId = function(tableName,id) {
	runQuery('DELETE FROM ' + tableName + ' WHERE id = ' + id + ';');
}
exports.deleteAll = function(tableName) {
	runQuery('DELETE FROM ' + tableName);
}
exports.findRowsWithId = function(tableName,id) {
	var obj = {};
	obj['id'] = id;
	return runQueryGetWhere(tableName,obj);
}
exports.findRowsWithProp = function(tableName,key,value) {
	var obj = {};
	obj[key] = value;
	console.log('Inside Frwp: ' + obj);
	return runQueryGetWhere(tableName,obj);
}
exports.findFirstRow = function(tableName) {
	
	return runQueryGetAll(tableName,'first');
}
exports.findLastRow = function(tableName) {
	return runQueryGetAll(tableName,'last');
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

	runQuery('UPDATE ' + tableName + ' SET ' + query + where + ';');
}