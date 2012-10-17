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
		res.end(exceptions.noController(controllerName+'_controller'));
	}

	var controller = require(process.cwd() + '/app/controllers/' + controllerName + '_controller.js');

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
	context.fs = require('fs');
	context.params = params;
	context.redirect_to = helpers.redirect_to;
	context.render = helpers.render;
	
	if(fs.existsSync(process.cwd() + '/config/bundle.js')) {
		var bundle = require(process.cwd() + '/config/bundle.js').bundle;
		
		for(var i=0; i < bundle.length; i++) {
			context[bundle[i]] = require(bundle[i]);
		}
	} else {
		console.log('Bundle not found. Do bundle install!');
	}
		
	for(var key in route_helpers) {
		context[key] = route_helpers[key];
	}

	var modelClasses = initModels();
	for(var key in modelClasses) {
		context[key] = modelClasses[key];
	}
	context['$'] = {};

	if(controller[controllerName][actionName]) {
		var actionFunction = controller[controllerName][actionName].toString().replace('function ()','');
		var res = vm.runInNewContext(actionFunction,context);
		//var res = controller[controllerName][actionName]();
		if(res) {
			if(res.status == 302) {
				response.statusCode = 302;
				response.setHeader("Location", res.response);
				response.end();
			}
			if(res.json) {
				response.setHeader('Content-Type','text/json');
				response.end(res.json);
			}
			console.log('res : ' + util.inspect(res));
			if(res.xml) {
				response.setHeader('Content-Type','text/xml');
				response.end(res.xml);
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
	var helper = require(process.cwd() + '/app/helpers/' + controllerName + '_helper.js')[controllerName];
	
	var appHelper = require(process.cwd() + '/app/helpers/application_helper.js').application;
	for(var key in appHelper) {
		viewContext[key] = appHelper[key];
	}
	for(var key in modelClasses) {
		viewContext[key] = modelClasses[key];
	}
	for(var key in helper) {
		viewContext[key] = helper[key];
	}
	console.log(util.inspect(helper))
	
	viewContext['$'] = context['$'];
	render(response,viewContext);
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
			response.end(html);
		} else {
			response.end(exceptions.templateMissing(utils.removeLeadingSlash(url)));
		}
	}
}

exports.initModels = initModels;

function initModels() {

	var models = {

	}
	mods = [];
	var modelsArray = fs.readdirSync(process.cwd() + '/app/models');
	var modelSchemas = {};
	var modelClasses = {};
	var modelInstances = {};


	for(var m in modelsArray) {
		var modelName = modelsArray[m].split('.')[0];
		mods.push(modelName);
		modelSchemas[modelName] = require(process.cwd() + '/db/' + modelName + '_schema.js').schema;
	}
	

	function modelInstance(tableName,props,obj) {
		this.table_name = tableName;
		this.id = undefined;
		for(var p in props) {
			this[p] = undefined;
		}
		
		var model = require(process.cwd() + '/app/models/' + this.table_name + '.js');
		
		for(var m in model[this.table_name]) {
			this[m] = model[this.table_name][m];
		}
		if(obj) {
			for(var o in obj) {
				
				if(this.belongsTo) {
					if(o == this.belongsTo) {
						console.log('Eureka got the ' + this.belongsTo + ' : ' + obj[o]);
						this[this.belongsTo + '_id'] = obj[o].id;
						continue;
					}
				}
				this[o] = obj[o];
				
				console.log('key : ' + o + ' value : ' + util.inspect(obj[o]));
			}
		}
		if(this.belongsTo) {
			console.log(tableName + ' belongs to ' + this.belongsTo);
			this[this.belongsTo] = function() {
				var inf = require('inflection');
				var className = inf.camelize(this.belongsTo);
				console.log('Class Name : ' + className);
				var modelClass = modelClasses[className];
				console.log('ModelClass : ' + util.inspect(modelClass));
				var field = this.belongsTo + '_id';
				console.log('find() :' + util.inspect(modelClass.find(this[field])));
			}
			
			
		}
		if(this.hasMany) {
			console.log(tableName + ' has many ' + this.hasMany);
			this[this.hasMany] = function() {
				console.log('This function will return an array of ' + this.hasMany);
				var inf = require('inflection');
				var className = inf.camelize(inf.singularize(this.hasMany));
				console.log('Class Name : ' + className);
				var modelClass = modelClasses[className];
				console.log('ModelClass : ' + util.inspect(modelClass));
				console.log('find by() :' + util.inspect(modelClass.findBy(this.table_name + '_id',this.id)));
				return modelClass.findBy(this.table_name + '_id',this.id);
			}
		}
		
		if(this.hasOne) {
			console.log(tableName + ' has one ' + this.hasOne);
			this[this.hasOne] = function() {
				console.log('This function will return an array of ' + this.hasOne);
				var inf = require('inflection');
				var className = inf.camelize(inf.singularize(this.hasOne));
				console.log('Class Name : ' + className);
				var modelClass = modelClasses[className];
				console.log('ModelClass : ' + util.inspect(modelClass));
				console.log('find by() :' + util.inspect(modelClass.findBy(this.table_name + '_id',this.id)));
				return modelClass.findBy(this.table_name + '_id',this.id);
			}
		}
		
		
		this.save = function() {
			
			if(this.validate()) {
				dbase.saveRecord(this.table_name,this);
				return true;
			} else {
				return false;
			}
			
		}
		this.validate = function() {
			console.log('**********************************************************************')
			var schema = require(process.cwd() + '/db/' + this.table_name + '_schema.js').schema;
			var bool = true;
			var errors = [];
			if(this.belongsTo) {
				var inf = require('inflection');
				var modelClass = modelClasses[inf.camelize(this.belongsTo)];
				if(inf.camelize(modelClass.hasOne) == this.table_name) {
					var myClass = modelClasses[this.table_name];
					if(this[this.belongsTo + '_id']) {
						var row = myClass.findBy(this.belongsTo + '_id',this[this.belongsTo + '_id']);
						console.log('ROW : ' + util.inspect(row));
						console.log(row.length);
						if(row.length) {
							console.log('validation failed : ' + this.table_name + ' for ' + this.belongsTo + ' : ' 
								+ this[this.belongsTo + '_id']
								+ ' already exists' );
							bool = false;
							errors.push(this.table_name + ' for ' + this.belongsTo + ' : ' 
								+ this[this.belongsTo + '_id']
								+ ' already exists');
						}
					} else {
						console.log('validation failed : ' + this.belongsTo + '_id required' );
						bool = false;
						errors.push(this.belongsTo + '_id required' );
					}
				}
			}
			if(this.validates) {
				
				for(var prop in schema) {
					console.log('Validation for ' + prop + '=> ' + util.inspect(this.validates[prop]));
					if(this.validates[prop].presence == true) {
						if(this[prop]) {
							console.log('validation passed!');
						} else {
							bool = false;
							errors.push(prop + ' should not be null');
							console.log('validation failed : ' + prop + ' should not be null');	
						}
						
					}
					if(this.validates[prop].uniqueness == true) {
						
						console.log(prop + ' should be unique');
					}
					if(this.validates[prop].length) {
						var min = this.validates[prop].length.minimum;
						var max = this.validates[prop].length.maximum;
						if(min) {
							if(this[prop] && this[prop].length > min) {
								console.log('validation passed!');
							} else {
								bool = false;
								errors.push(prop + ' should be more than ' + min + ' chars');
								console.log('validation failed :' + prop + ' should be more than ' + min + ' chars');	
							}
							
						}
						if(max) {
							if(this[prop] && this[prop].length < max) {
								console.log('validation passed!');
							} else {
								bool = false;
								errors.push(prop + ' should be less than ' + max + ' chars');
								console.log('validation failed : ' + prop + ' should be less than ' + max + ' chars');	
							}
							
						}
					}
					
				}
			}
			this.errors = errors;
			console.log('**********************************************************************')
			
			return bool;
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
			return JSON.stringify(obj);
		}
		this.toXML = function() {
			var schema = require(process.cwd() + '/db/' + this.table_name + '_schema.js').schema;

			var obj = {};

			for(var attr in schema) {
				obj[attr] = this[attr];
			}
			var jstoxml = require('jstoxml');
			return jstoxml.toXML(obj);
			
		}
		
	}

	function modelClass(tableName,props) {

		this.table_name = tableName;
		this.properties = props;
		var model = require(process.cwd() + '/app/models/' + this.table_name + '.js');
		
		for(var m in model[this.table_name]) {
			this[m] = model[this.table_name][m];
		}
		
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
			
			var r = dbase.all(this.table_name);
			
			return rowsToModelInstances(tableName,r);
		}

		this.where = function(obj,cb) {
			var r = dbase.where(this.table_name,obj);
		
			return rowsToModelInstances(tableName,r);
		}

		this.delete = function(id) {
			dbase.deleteRowsWithId(this.table_name,id);
		}
		this.delete_all = function() {
			dbase.deleteAll(this.table_name);
		}
		this.find = function(id) {
			
			var r = dbase.findRowsWithId(this.table_name,id);
			if(r[0] == undefined) {
				return null;
			}
			return rowToModelInstance(this.table_name,r[0]);
		}
		
		this.findBy = function(key,value) {
			var r = dbase.findRowsWithProp(this.table_name,key,value);
			if(r == []) {
				return null;
			}
			return rowsToModelInstances(this.table_name,r)
		}
		

		this.first = function() {
			var r = dbase.findFirstRow(this.table_name);
			return rowToModelInstance(tableName,r);
		}
		this.last = function() {
			dbase.findLastRow(this.table_name);
			return rowToModelInstance(tableName,r);
		}
	}

		for(var m in mods) {
			modelClasses[mods[m]] = new modelClass(mods[m],modelSchemas[mods[m]]);
		}
	return modelClasses;
}
