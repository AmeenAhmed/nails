var sqlite = require('sqlite3').verbose();
var fs = require('fs');

exports.create = function(name) {
	console.log('Creating the file at ' + process.cwd() + '/db/tables.js');
	fs.writeFileSync(process.cwd() + '/db/tables.js','exports.tables = [\n\n\n]','utf-8');
	var db = new sqlite.Database(process.cwd() + '/db/' + name + '.sqlite');
	console.log('Creating the folder ' + process.cwd() + '/db/migrate');
	fs.mkdirSync(process.cwd() + '/db/migrate');
	db.close();
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
	var milliseconds = prefixZero(date.getMilliseconds());

	return date.getYear() + month + dateNum + hours + minutes + seconds + milliseconds;
}
exports.createModel = function(modelName,params) {
	console.log('Creating the model file at ' + process.cwd() + '/app/models/' + modelName + '.js');
	//fs.writeFileSync(process.cwd() + '/app/models/' + modelName + '.js','exports.'+modelName +' = {\n\n\n}');
	console.log('Creating the file ' + process.cwd() + '/db/' + modelName+'_schema.js');
	var str = 'exports.schema = {\n\n';
	for(var p=0;p<params.length-1;p++) {
		var attr = params[p].split(':');
		str += '\'' + attr[0] + '\' : ' + attr[1] + ',\n';
	}
	var attr = params[params.length-1].split(':');
	str += '\'' + attr[0] + '\' : ' + attr[1];
	
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