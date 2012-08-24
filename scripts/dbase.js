var sqlite = require('sqlite3').verbose();
var fs = require('fs');
var util = require('util');

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
		//console.log(rows);
		cb(rows);
	});
	db.close();
}

exports.getRowsFromTable = function(tableName,cb) {
	var name = 'development';
	var db = new sqlite.Database(process.cwd() + '/db/' + name + '.sqlite','OPEN_READWRITE');
	db.all('SELECT * FROM sqlite_master;',function(err,rows) {
		console.log(err);
		console.log(rows);
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
	var fields = 'id INT PRIMARY KEY ASC';
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
}