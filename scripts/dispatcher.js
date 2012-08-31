var fs = require('fs');
var ejs = require('ejs');
var helpers = require('./helpers');
var vm = require('vm');
var exceptions = require('./exceptions');
var utils = require('./utils');
var dbase = require('./dbase');
var util = require('util');

exports.runAndRender = function(controllerName,actionName,url,params,request,response,route_helpers) {
	if(!fs.existsSync(process.cwd() + '/app/controllers/' + controllerName + '_controller.js')) {
		return exceptions.noController(controllerName+'_controller');
	}

	var controller = require(process.cwd() + '/app/controllers/' + controllerName + '_controller.js');
	/*controller[controllerName][actionName].data = {};
	controller[controllerName][actionName].params = params
	controller[controllerName].token = token */
	// test code to test the possibility of using the vm module to execute the action code.
	//-------------------------------------------------------------------------------------
	var context = {

	}
	context.data = { 
		set : function(key,val) {
			this[key] = val;
		}
	};

	context.log = {
		print : function(x) {
			console.log(x);
		}
	}
	
	context.util = require('util');
	context.params = params;
	context.redirect_to = helpers.redirect_to;
	
	for(var key in route_helpers) {
		context[key] = route_helpers[key];
	}

	var modelClasses = initModels();
	for(var key in modelClasses) {
		context[key] = modelClasses[key];
	}

	console.log(context);

	//controller[controllerName].redirect_to = helpers.redirect_to;

	if(controller[controllerName][actionName]) {
		//var res = controller[controllerName][actionName]();
		var actionFunction = controller[controllerName][actionName].toString().replace('function ()','');

		var res = vm.runInNewContext(actionFunction,context);
		if(res) {
			if(res.status == 302) {
				response.statusCode = 302;
				response.setHeader("Location", res.response);
				response.end();
			}
		}
	} else {
		response.end(exceptions.unknownAction(actionName,controllerName));
	}
	var viewFileName = process.cwd() +'/app/views/'+controllerName+'/'+ actionName +'.html.ejs';
	var layoutName = process.cwd() + '/app/views/layouts/application.html.ejs';

	var viewContext = {};
	for(var key in route_helpers) {
		viewContext[key] = route_helpers[key];
	}
	function waitTillNextTick() {
		process.nextTick(function(){
			if(global.callbackCount) {
				console.log("After Action ------------------------------------------------------------------------------")
				console.log(global.callbackCount);
				waitTillNextTick();

			}
			else {
				
				viewContext['data'] = context.data;
				
				console.log(global.callbackCount);
				render(response,viewContext);	

			}
		});
	}
	waitTillNextTick();
	function render(response,viewContext) {
		
		if(fs.existsSync(viewFileName)) {
			 html = ejs.render(fs.readFileSync(layoutName,'utf-8'), {yield : function() {
				return ejs.render(fs.readFileSync(viewFileName,'utf-8'), viewContext);
			}, 
			scripts: function() {
				
				var scriptsHtml = '';
				var fileList = fs.readdirSync(process.cwd() + '/public/js');

				for(var i=0;i<fileList.length;i++) {
					scriptsHtml += '<script type="text/javascript" src="/'+fileList[i]+
								'"></script>\n';
				}
				return scriptsHtml;
			
			},
			styles: function() {
				var stylesHtml = '';
				var fileList = fs.readdirSync(process.cwd() + '/public/css');

				for(var i=0;i<fileList.length;i++) {
					stylesHtml += '<link rel="stylesheet" type="text/css" href="/'+fileList[i]+
								'" />\n';
				}
				return stylesHtml;

			}
			
		});
			//return ejs.render(fs.readFileSync(viewFileName,'utf-8'), {data:controller[controllerName].data});
			response.end(html);
		} else {
			response.end(exceptions.templateMissing(utils.removeLeadingSlash(url)));
		}
	}
}


function initModels() {
	console.log('===========================================================================');
	console.log('			Init Models function');
	console.log('===========================================================================');
	var models = {

	}
	mods = [];
	var modelsArray = fs.readdirSync(process.cwd() + '/app/models');
	var modelSchemas = {};
	var modelClasses = {};
	var modelInstances = {};

	console.log(modelsArray);

	for(var m in modelsArray) {
		var modelName = modelsArray[m].split('.')[0];
		mods.push(modelName);
		modelSchemas[modelName] = require(process.cwd() + '/db/' + modelName + '_schema.js').schema;
	}

	console.log(modelSchemas);
	console.log(mods);

	
	function modelInstance(tableName,props,obj) {
		this.table_name = tableName;
		this.id = undefined;
		for(var p in props) {
			this[p] = undefined;
		}

		if(obj) {
			for(var o in obj) {
				this[o] = obj[o];
			}
		}
		this.save = function() {
			return dbase.saveRecord(this.table_name,this);
		}
		this.clone = function() {
			return this;
		}
		this.delete = function() {
			return dbase.deleteRecord(this.table_name,this);
		}
		this.update = function() {
			return dbase.updateRecord(this.table_name,this);
		}
		this.toJSON = function() {

			var schema = require(process.cwd() + '/db/' + this.table_name + '_schema.js').schema;

			var obj = {};

			for(var attr in schema) {
				obj[attr] = this[attr];
			}
			console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
			console.log(obj);
			console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
			return JSON.stringify(obj);
		}
	}

	function modelClass(tableName,props) {

		this.table_name = tableName;
		this.properties = props;

		
		function rowToModelInstance(tableName,row) {
			var obj = new modelInstance(tableName,this.properties,row);
			
			return obj;
		}

		function rowsToModelInstances(tableName,rows) {
			var objs = [];
			for(var row in rows) {
				var obj = rowToModelInstance(tableName,rows[row]);
				objs.push(obj);
			}
			return objs;
		}


		this.new = function() {
			return new modelInstance(this.table_name,this.properties);
		}

		this.create = function(obj) {
			var m = new modelInstance(this.table_name,this.properties,obj);
			m.save();
			return m;
		}

		this.all = function(cb) {
			dbase.all(this.table_name,function(rows,tableName) {
				cb(rowsToModelInstances(rows,tableName));
			});
			
		}

		this.where = function(obj,cb) {
			dbase.where(this.table_name,obj,function(rows,tableName) {
				cb(rowsToModelInstances(rows,tableName));	
			});
			
		}

		this.delete = function(id) {
			dbase.deleteRowsWithId(this.table_name,id);
		}
		this.delete_all = function() {
			dbase.deleteAll(this.table_name);
		}
		this.find = function(id,cb) {
			dbase.findRowsWithId(this.table_name,id,function(rows,tableName) {
				cb(rowToModelInstance(tableName,rows[0]));
			});
			
		}
		
		//this.find_by_sql = function(sql) {
		//	var rows = dbase.findRowsBySql(this.table_name,sql);
		//	return rowToModelInstances(rows);
		//}

		this.first = function(cb) {
			global.callbackCount++;
			dbase.findFirstRow(this.table_name,function(row,tableName) {
				cb(rowToModelInstance(tableName,row));
				global.callbackCount--;
			});
		}
		this.last = function(cb) {
			global.callbackCount++;
			dbase.findLastRow(this.table_name,function(row,tableName) {

				cb(rowToModelInstance(tableName,row));
				global.callbackCount--;
			});
		}
	}

		for(var m in mods) {
			modelClasses[mods[m]] = new modelClass(mods[m],modelSchemas[mods[m]]);
		}
		console.log(modelClasses);

	console.log('===========================================================================');
	console.log('===========================================================================');

	return modelClasses;
	
}
