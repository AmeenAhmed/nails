// @Author : Ameen Ahmed
// dbase.js :
// This file contains the code for accessing the db by the models

var sqlite = require('sqlite3').verbose();
var fs = require('fs');
var util = require('util');
var Fiber = require('fibers');
var colors = require('colors');
var log = require('./../log');

// function	: 	create
// args		: 	the name of the db to create
// returns	: 	nothing
// desc		: 	called from the command $ nails db:create to create the db


exports.create = function(name) {
	
	fs.writeFileSync(process.cwd() + '/db/tables.js','exports.tables = [\n\n\n]','utf-8');
	var db = new sqlite.Database(process.cwd() + '/db/' + name + '.sqlite');
	
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

// function	: 	getSchema
// args 	: 	mName => tableName
// returns	: 	the schema object
// desc		: 	utility function to get the schema of a table

exports.getSchema = function(mName) {
	if(fs.existsSync(process.cwd() + '/db/' + mName + '_schema.js')) {
		var schema = require(process.cwd() + '/db/' + mName + '_schema.js').schema;
		return schema;	
	} else {
		console.log('\tError : '.red + 'can\'t find table ' + mName);
		process.exit(0);
	}
	
}
var getSchema = exports.getSchema;

// function : 	getCurrentMigrationTimestamp
// args		: 	cb => callback t
// returns	: 	the current migration timestamp
// desc		: 	queries the db and returns the current migration timestamp which is stored in a special table
exports.getCurrentMigrationTimestamp = function(cb) {
	var name = 'development';
	var db = new sqlite.Database(process.cwd() + '/db/' + name + '.sqlite','OPEN_READWRITE');
	db.all('SELECT * FROM migration;',function(err,rows) {
		cb(rows);
	});
	db.close();
}

// function	: 	setCurrentMigrationTimestamp
// args		: 	ts => the timestamp to store in the db
// returns 	: 	nothing
// desc 	: 	updates the current migration timestamp in the db
exports.setCurrentMigrationTimestamp = function(ts,cb) {
	var name = 'development';
	var db = new sqlite.Database(process.cwd() + '/db/' + name + '.sqlite','OPEN_READWRITE');

	db.run('DELETE FROM migration;',function(err) {
		db.run('INSERT INTO migration VALUES (?);',ts);
		cb(err);
	});

}
// function	: 	prefixZero
// desc 	: 	util function to prefix zero to a number if less than 10 used by generateTimestamp

function prefixZero(num) {
	if(num < 10) {
		return "0" + num;
	}
	return num;
}

// function	: 	generateTimestamp
// args 	: 	nothing
// returns 	: 	a timestamp string from the current time
// desc		: 	util function to generate a timestamp string from the current time
function generateTimestamp() {
	var date = new Date();
	var month = prefixZero(date.getMonth());
	var dateNum = prefixZero(date.getDate());
	var hours = prefixZero(date.getHours());
	var minutes = prefixZero(date.getMinutes());
	var seconds = prefixZero(date.getSeconds());

	return date.getYear() + month + dateNum + hours + minutes + seconds;
}
exports.generateTimestamp = generateTimestamp;

// function	: 	writeSchema
// args		: 	tableName => the name of the table for which the schema is to be created
//				params => the fields in the table
// returns 	: 	nothing
// desc		: 	creates a schema file with the name of the table under db/
exports.writeSchema = function(tableName,params) {
	
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
	
}

// function : 	createModel
// args		: 	modelName => the name of the model
//				params => fields in the table related to the model
// returns 	: 	nothing
// desc		: 	called by the command $ nails generate model <modelname> < field [field] ... > 
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

// function	: 	createTable
// args		: 	tableName => the name of the table
//				tableFields => the fields to be created in the table
// returns	: 	nothing
// desc		: 	to be called from the migration to create a table

exports.createTable = function(tableName,tableFields) {

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
	console.log('\tissuing sql statement '.grey + sql);

	
	var r = runQuery(sql);
	if(r) {
		console.log("\tCreate Table error : ".red + r);	
	} else {
		console.log('\tCreate Table successfull'.green);
	}
}

// function	: 	dropTable
// args		: 	tableName => the name of the table
// returns	: 	nothing
// desc		: 	to be called from the migration to drop a table

exports.dropTable = function(tableName) {
	
	var sql = 'DROP TABLE ' + tableName + ';';
	console.log('\tissuing sql statement '.grey + sql);
	
	var r = runQuery(sql);
	if(r) {
		console.log("\tDrop Table error : ".red + r);	
	} else {
		console.log('\tDrop Table successfull'.green);
	}
}

// function	: 	renameTable
// args		: 	oldName => the old name of the table
//				newName => the new name of the table
// returns	: 	nothing
// desc		: 	to be called from the migration to rename a table

exports.renameTable = function(oldName,newName) {
	var sql = 'ALTER TABLE ' + oldName + ' RENAME TO ' + newName + ';';
	console.log('\tissuing sql statement '.grey + sql);
	var r = runQuery(sql);
	if(r) {
		console.log("\tRename Table error : ".red + r);	
	} else {
		console.log('\tRename table successfull'.green);
	}
}

// function	: 	addColumn
// args		: 	tableName => the name of the table
//				columnName => the name of the column to be added
//				type => the column data type
//				options => righ now, nothing, {}
// returns	: 	nothing
// desc		: 	to be called from the migration to add a column to the specified table

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
	console.log('\tissuing sql statement '.grey + sql);

	var r = runQuery(sql);
	if(r) {
		console.log("\tAdd Column error : ".red + r);	
	} else {
		console.log('\tAdd Column successfull'.green);
	}
}

// function	: 	renameColumn
// args		: 	tableName => the name of the table
//				columnName => the name of the column whose values are to be changed
//				newColumnName => the new column name
// returns	: 	nothing
// desc		: 	to be called from the migration to rename a column name

exports.renameColumn = function(tableName,columnName,newColumnName) {

	var schema = getSchema(tableName);
	var sql = 'ALTER TABLE ' + tableName + ' RENAME TO ' + tableName + '_temp;';
	
	runQuery(sql);
	
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
	
	runQuery(sql);
	return new_schema;
}

// function	: 	changeColumn
// args		: 	tableName => the name of the table
//				columnName => the name of the column to be added
//				type => the column data type
//				options => righ now, nothing, {}
// returns	: 	nothing
// desc		: 	to be called from the migration to change a column's type

exports.changeColumn = function(tableName,columnName,type,options) {
	var schema = getSchema(tableName);
	
	this.renameTable(tableName,'temp_' + tableName);
	
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

// function	: 	removeColumn
// args		: 	tableName => the name of the table
//				columnName => the name of the column to be added
// returns	: 	nothing
// desc		: 	to be called from the migration to remove a column from the table

exports.removeColumn = function(tableName,columnName) {
	
	var schema = getSchema(tableName);
	this.renameTable(tableName,'temp_' + tableName);
	
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

// function	: 	runQuery
// args		: 	sql => the sql string to execute
// returns 	: 	an error if any
// desc		: 	util function to run a query

function runQuery(sql) {
	var db = new sqlite.Database(process.cwd() + '/db/' + getDbName() + '.sqlite','OPEN_READWRITE');
	var fiber = Fiber.current;
	console.log('executing sql => '.grey + sql);
	db.run(sql, function(err) {
	 	
	 	fiber.run(err);
	});
	var r = Fiber.yield();
	db.close();	
	return r;
}

// function	: 	runQueryGetAll
// args		: 	tableName => The name of the table on which querying is done
//				point => first | last | null 
//				first -> the first row is returned
//				last -> the last row is returned
//				null -> all the rows are returned
// returns 	: 	row(s)
// desc		: 	util function to run a query a return rows

function runQueryGetAll(tableName,point) {

	var db = new sqlite.Database(process.cwd() + '/db/' + getDbName() + '.sqlite','OPEN_READWRITE');
	
	var fiber = Fiber.current;
	var sql = 'SELECT * FROM ' + tableName + ';';
	console.log('executing sql => '.grey + sql);
	db.all(sql,function(err,rows) {
		
		if(err) {
			log.error(err);
			fiber.run(null);
		}
	 	if(point) {
	 		if(point == 'first') {
	 			fiber.run(rows[0]);
	 		} else if(point == 'last') {
	 			fiber.run(rows[rows.length-1]);
	 		}
	 	} else {
	 		fiber.run(rows);	
	 	}
	 	
	});
	var r = Fiber.yield();
	
	db.close();
	return r;
}

// function	: 	runQueryGetWhere
// args		: 	tableName => The name of the table on which querying is done
//				obj => the object which contains field names and values to query the db
// returns 	: 	rows
// desc		: 	util function to run a query a return rows with a where clause

function runQueryGetWhere(tableName,obj) {
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
	var fiber = Fiber.current;
	var sql = 'SELECT * FROM ' + tableName + where + ';';
	console.log('executing sql => '.grey + sql);
	db.all('SELECT * FROM ' + tableName + where + ';',function(err,rows) {
	 	
	 	if(err) {
	 		log.error(err);
	 		fiber.run(null);
	 	}
	 	
	 	fiber.run(rows);
	 	
	});
	var r = Fiber.yield();
	db.close();
	return r;
}

// function	: 	getDbName
// desc		: 	util function to return the db name
function getDbName() {
	//TODO : Hardcoded to development now. Implement method to find the current environment
	return "development";
}

// Model methods

// function	: 	saveRecord
// args		: 	tableName => name of the table
//				model => the instance of the model to get the values of the fields
// returns	: 	the error object if any or null
// desc		: 	called from save method of the model instance

exports.saveRecord = function(tableName,model) {
	console.log('===========================================================================');
	log.info('Saving a row to the table ' + tableName);
	console.log('===========================================================================');
	var schema = getSchema(tableName);
	var vals = '';
	var attribs = '';
	row = {};
	var i = 0 ;

	for(var prop in schema) {
		var t = '';
		if(i > 0) {
			vals += ',';
			attribs += ',';	
		} 
		if(schema[prop] == 'string') t='\'';
		attribs += prop;
		row[prop] = model[prop];
		vals += t + model[prop] + t;
		i++;
	}
	console.log('row -> '.grey + util.inspect(row));
	var start = Date.now();
	var err = runQuery('INSERT INTO ' + tableName + '('+ attribs +')' + ' VALUES (' + vals + ');');
	var end = Date.now();
	var diff = end-start;
	if(!err) {
		log.info('Sucess '.green + 'the query took '.grey + diff + ' MS');
	}
	console.log('===========================================================================');
	return err;
}

// function	: 	all
// args		: 	tableName => the name of the table
// returns 	: 	an array of the all the rows in the table
// desc		: 	called from the model class all method

exports.all = function(tableName) {
	console.log('===========================================================================');
	log.info('Retrieving all the rows from the table ' + tableName);
	console.log('===========================================================================');
	var start = Date.now();
	var rows = runQueryGetAll(tableName,null);
	if(rows) {
		var end = Date.now();
		var diff = end - start;
		console.log('rows -> '.grey + util.inspect(rows));
		log.info('Sucess '.green + 'the query took '.grey + diff + ' MS');
		console.log('===========================================================================');
		return rows; 
	}
	return null;
}

// function	: 	where
// args		: 	tableName => the name of the table
// 				obj => the fields and their values to be searched in the table
// returns	: 	the resultant array of rows
// desc		: 	called from the where method in the model class

exports.where = function(tableName,obj) {
	console.log('===========================================================================');
	log.info('Retrieving all the rows from the table' + tableName + ' where ' + util.inspect(obj));
	console.log('===========================================================================');
	var rows = runQueryGetWhere(tableName,obj);
	if(rows) {
		var end = Date.now();
		var diff = end - start;
		console.log('rows -> '.grey + util.inspect(rows));
		log.info('Sucess '.green + 'the query took '.grey + diff + ' MS');
		console.log('===========================================================================');
		return rows;
	}
	return null;
}

// function	: 	deleteRowsWithId
// args		: 	tableName => the name of the table
//				id => the id field's value of the row which is to be deleted
// returns	: 	error object if any or null
// desc		: 	called from delete method in model instance
 
exports.deleteRowsWithId = function(tableName,id) {
	console.log('===========================================================================');
	log.info('delete row with id ' + id + ' from the table ' + tableName);
	console.log('===========================================================================');
	var start = Date.now();
	var err =  runQuery('DELETE FROM ' + tableName + ' WHERE id = ' + id + ';');
	var end = Date.now();
	var diff = end-start;
	if(!err) {
		log.info('Sucess '.green + 'the query took '.grey + diff + ' MS');
	}
	console.log('===========================================================================');
	return err;
}

// function	: 	deleteAll
// args		: tableName => the name of the table
// returns	: error if an or null
// desc		: called from the deleteAll method in the model class

exports.deleteAll = function(tableName) {
	console.log('===========================================================================');
	log.info('deleting all the rows from the table ' + tableName);
	console.log('===========================================================================');
	var start = Date.now();
	var err = runQuery('DELETE FROM ' + tableName);
	var end = Date.now();
	var diff = end-start;
	if(!err) {
		log.info('Sucess '.green + 'the query took '.grey + diff + ' MS');
	}
	console.log('===========================================================================');
	return err;
}

// function	: 	findRowsWithId
// args		: 	tableName => the name of the table
//				id => the id fields value to be searched in the table
// returns 	: 	the row
// desc		: 	called from the find method in model class

exports.findRowsWithId = function(tableName,id) {
	console.log('===========================================================================');
	log.info('find row with id ' + id + ' from the table ' + tableName);
	console.log('===========================================================================');
	var obj = {};
	obj['id'] = id;
	var start = Date.now();
	var rows = runQueryGetWhere(tableName,obj);
	if(rows) {
		var end = Date.now();
		var diff = end - start;
		console.log('rows -> '.grey + util.inspect(rows));
		log.info('Sucess '.green + 'the query took '.grey + diff + ' MS');
		console.log('===========================================================================');
		return rows;
	}
	return null;
}

// function	: 	findRowsWithProperty
// args		: 	tableName => the name of the table
// 				key => the name of the field
//				value => the value in the field to be searched
// returns	: 	an array with the found rows
// desc		: 	called from the where method in the model class

exports.findRowsWithProp = function(tableName,key,value) {
	console.log('===========================================================================');
	log.info('find row from the table ' + tableName + ' where ' + key + '=' + value);
	console.log('===========================================================================');
	var obj = {};
	obj[key] = value;
	
	var start = Date.now();
	return runQueryGetWhere(tableName,obj);
	if(rows) {
		var end = Date.now();
		var diff = end - start;
		console.log('rows -> '.grey + util.inspect(rows));
		log.info('Sucess '.green + 'the query took '.grey + diff + ' MS');
		console.log('===========================================================================');
		return rows;
	}
	return null;
}

// function	: 	findFirstRow
// desc		: 	returns the first row in the table. called from first method in model class.
 
exports.findFirstRow = function(tableName) {
	var start = Date.now();
	var row = runQueryGetAll(tableName,'first');
	if(row) {
		var end = Date.now();
		var diff = end - start;
		console.log('row -> '.grey + util.inspect(row));
		log.info('Sucess '.green + 'the query took '.grey + diff + ' MS');
		console.log('===========================================================================');
		return rows;
	}
	return null;
}

// function	: 	findLastRow
// desc		: 	returns the last row in the table. called from the last method in model class.

exports.findLastRow = function(tableName) {
	var start = Date.now();
	var row = runQueryGetAll(tableName,'last');
	if(row) {
		var end = Date.now();
		var diff = end - start;
		console.log('row -> '.grey + util.inspect(row));
		log.info('Sucess '.green + 'the query took '.grey + diff + ' MS');
		console.log('===========================================================================');
		return rows;
	}
	return null;
}

// function	: 	deleteRecord
// desc		: 	deletes the row identified by the model. called from delete method in the model instance.

exports.deleteRecord = function(tableName,model) {
	exports.deleteRowsWithId(tableName,model.id);
}

// function	: 	updateRecord
// desc		: 	updates the row in the table identified by the model in the table. called from update method 
//				in the model instance

exports.updateRecord = function(tableName,model) {
	
	var schema = getSchema(tableName);
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
	var start = Date.now();
	var err = runQuery('UPDATE ' + tableName + ' SET ' + query + where + ';');
	var end = Date.now();
	var diff = end-start;
	if(!err) {
		log.info('Sucess '.green + 'the query took '.grey + diff + ' MS');
	}
	console.log('===========================================================================');
	return err;
}