// @Author : Ameen Ahmed
// dispatcher.js :
// This file contains the code for dispatching a request. Find the controller and execute the action and 
// render the appropriate template. 


var fs = require('fs');
var ejs = require('ejs');
var helpers = require('./helpers');
var vm = require('vm');
var exceptions = require('./exceptions');
var utils = require('./utils');
var dbase = require('./dbase');
var util = require('util');
var viewHelpers = require('./view_helpers');
var log = require('./../log');


// function	: 	runAndRender
// args		: 	controllerName => The name of the controller
//				actionName => The name of the action to be executed in the controller
//				url => url hit by the browser
//				params => params object
//				request => request object
//				respone => response object
//				route_helpers => the route helpers
// 				session => the session object got from the cookies
// returns	: nothing
// desc		: 	gets the controller with the name controllerName and executes the action actionName and renders 
//				the template for the action

exports.runAndRender = function(controllerName,actionName,url,params,request,response,route_helpers,session) {
	// check if the controller file with the controllerName exists if not return the noController exception
	// to the browser and return
	if(!fs.existsSync(process.cwd() + '/app/controllers/' + controllerName + '_controller.js')) {
		response.end(exceptions.noController(controllerName+'_controller'));
		return;	
	}
	
	// get the controller with the controllerName
	var controller = require(process.cwd() + '/app/controllers/' + controllerName + '_controller.js');
	
	// The context object which is to be sent to the vm module when the action code is executed.
	// the action function will see these things in its global scope
	var context = {

	}
	
	// get the session vars to be sent to the action function [ session hash and flash hash ]
	var cookies = require('./cookies');
	context.session = session;
	context.flash = {};
	context.cookies = cookies.getSessionHash(request,response,'cookies');
	
	// These objects needs to be passed to the vm or else the action function won't recognize them
	// as we are running them in a seperate context.
	context.console = console;
	context.util = require('util');
	context.fs = require('fs');
	context.params = params;
	context.redirectTo = helpers.redirectTo;
	context.render = helpers.render;
	
	// The modules which are installed via the bundler
	
	if(fs.existsSync(process.cwd() + '/config/bundle.js')) {
		var bundle = require(process.cwd() + '/config/bundle.js').bundle;
		
		for(var i=0; i < bundle.length; i++) {
			context[bundle[i]] = require(bundle[i]);
		}
	} else {
		log.error('Bundle not found. run $ nails bundle install');
	}
	
	// add the route_helpers to the context
	for(var key in route_helpers) {
		context[key] = route_helpers[key];
	}
	
	// get the model code [ model classes ] and put them in the context
	var modelClasses = initModels();
	for(var key in modelClasses) {
		context[key] = modelClasses[key];
	}
	// The $ object : the $ object is used to share code between the controller and the view
	// synonymous with the instance variables in ruby on rails
	context['$'] = {};

	// Main execution cycle begins
	// check whether the action is present in the controller if yes continue
	// first execute the before filters and around filters and then execute the action and again
	// around filters and finally after filters are executed
	// The before, around and after filter vars in the controller are arrays which contain the names
	// of the functions within the controller
	// TODO : Add only and except functionailty in the filters 
	if(controller[controllerName][actionName]) {
		
		var beforeFilters = controller[controllerName]['beforeFilter'];
		if(beforeFilters) {
			for(var i=0; i<beforeFilters.length; i++) {
				var bf = controller[controllerName][beforeFilters[i]].toString().replace('function ()','');
				vm.runInNewContext(bf,context);
			}
		}
		var aroundFilters = controller[controllerName]['aroundFilter'];
		if(aroundFilters) {
			for(var i=0; i<aroundFilters.length; i++) {
				var arf = controller[controllerName][aroundFilters[i]].toString().replace('function ()','');
				vm.runInNewContext(arf,context);
			}
		}
		
		var actionFunction = controller[controllerName][actionName].toString().replace('function ()','');
		var res = vm.runInNewContext(actionFunction,context);
		
		var afterFilters = controller[controllerName]['afterFilter'];
		if(aroundFilters) {
			for(var i=0; i<aroundFilters.length; i++) {
				var arf = controller[controllerName][aroundFilters[i]].toString().replace('function ()','');
				vm.runInNewContext(arf,context);
			}
		}
		if(afterFilters) {
			for(var i=0; i<afterFilters.length; i++) {
				var af = controller[controllerName][afterFilters[i]].toString().replace('function ()','');
				vm.runInNewContext(af,context);
			}
		}
		
		// the var which governs whether flash objects should persist or not in the request
		var persistFlash = false;
		// Set the session variables in cookies which are manipulated inside the action 
		
		cookies.setSessionHash(request,response,'session',context['session']);
		
		cookies.setSessionHash(request,response,'cookies',context['cookies']);
		
		// code for determining whether flash messages exists or not
		
		var empty = true;
		
		for(var key in context['flash']) {
			empty = false;
			break;
		}
		if(!empty) {
			cookies.setSessionHash(request,response,'flash',context['flash']);
			persistFlash = true;
		} else {
			context['flash'] = cookies.getSessionHash(request,response,'flash');
		}
		
		// the res var contains the value which s returned from the action when a redirect or render is called
		
		if(res) {
			// 302 redirect is called so send the redirect message to the browser
			if(res.status == 302) {
				response.statusCode = 302;
				response.setHeader("Location", res.response);
				response.end();
				return;
			}
			// render json so send back a json object
			if(res.json) {
				response.setHeader('Content-Type','text/json');
				response.end(res.json);
				return;
			}
			// render xml so send back an xml object
			if(res.xml) {
				response.setHeader('Content-Type','text/xml');
				response.end(res.xml);
				return;
			}
		}
	}
	// if the action is not found in the controller then return the unknownAction exception 
	else {
		response.end(exceptions.unknownAction(actionName,controllerName));
		return;
	}
	
	// get the view file
	var viewFileName = process.cwd() +'/app/views/'+controllerName+'/'+ actionName +'.html.ejs';
	// get the layout file application.html.ejs
	var layoutName = process.cwd() + '/app/views/layouts/application.html.ejs';
	// the viewContext : contains objects which are to be exposed to the views
	var viewContext = {};
	// add the route helpers to the view context
	for(var key in route_helpers) {
		viewContext[key] = route_helpers[key];
	}
	
	// get the application helper file which contains the helper functions to be exposed to all views
	var appHelper = require(process.cwd() + '/app/helpers/application_helper.js').application;
	// get the helper for the particular controller , yes Nails does not expose all the helpers
	// to all the views :)
	var helper = require(process.cwd() + '/app/helpers/' + controllerName + '_helper.js')[controllerName];
	
	for(var key in appHelper) {
		viewContext[key] = appHelper[key];
	}
	// This code gets the form helper functions and puts them in the context
	for(var key in viewHelpers) {
		viewContext[key] = viewHelpers[key];
	}
	// model classes to be exposed to the view [ Warning : using models directly in the view is evil ]
	for(var key in modelClasses) {
		viewContext[key] = modelClasses[key];
	}
	for(var key in helper) {
		viewContext[key] = helper[key];
	}
	
	// finally shared code from the controller to the view
	viewContext['$'] = context['$'];
	viewContext['session'] = context['session'];
	viewContext['flash'] = context['flash'];
	
	// null the flash because it is seen
	cookies.setSessionHash(request,response,"flash","{}");
	
	// render the view 
	render(response,viewContext);
	// function render : which gets the view and compiles the template and sends the html back 
	//					 to the browser
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
		}
		// if the view file is not found return the templateMissing exception 
		else {
			response.end(exceptions.templateMissing(utils.removeLeadingSlash(url)));
		}
	}
}

exports.initModels = initModels;

// function	: 	initModels
// args 	: 	nothing
// returns	: 	the model classes for the models which contains function synonymous to the model
//				class methods in ruby on rails
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
	
	// the model instance object which is returned by model class methods which contain one 
	// row in the table

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
						this[this.belongsTo + '_id'] = obj[o].id;
						continue;
					}
				}
				this[o] = obj[o];
			}
		}
		if(this.belongsTo) {
			this[this.belongsTo] = function() {
				var inf = require('inflection');
				var className = inf.camelize(this.belongsTo);
				var modelClass = modelClasses[className];
				var field = this.belongsTo + '_id';
			}
			
			
		}
		if(this.hasMany) {
			this[this.hasMany] = function() {
				var inf = require('inflection');
				var className = inf.camelize(inf.singularize(this.hasMany));
				var modelClass = modelClasses[className];
				return modelClass.findBy(this.table_name + '_id',this.id);
			}
		}
		
		if(this.hasOne) {
			this[this.hasOne] = function() {
				var inf = require('inflection');
				var className = inf.camelize(inf.singularize(this.hasOne));
				var modelClass = modelClasses[className];
				return modelClass.findBy(this.table_name + '_id',this.id);
			}
		}
		
		// the save method which inserts this object as a row in the table
		// returns true if succesful and false if not
		this.save = function() {
			
			if(this.validate()) {
				if(!dbase.saveRecord(this.table_name,this)) {
					return true
				} else {
					return false;	
				}
				
			} else {
				return false;
			}
			
		}
		// the validate method which validates the object against the validations present in the model
		// class
		this.validate = function() {
			
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
						if(row.length) {
							bool = false;
							errors.push(this.table_name + ' for ' + this.belongsTo + ' : ' 
								+ this[this.belongsTo + '_id']
								+ ' already exists');
						}
					} else {
						bool = false;
						errors.push(this.belongsTo + '_id required' );
					}
				}
			}
			if(this.validates) {
				
				for(var prop in schema) {
					if(this.validates[prop].presence == true) {
						if(this[prop]) {
						} else {
							bool = false;
							errors.push(prop + ' should not be null');	
						}
						
					}
					if(this.validates[prop].uniqueness == true) {
						
					}
					if(this.validates[prop].length) {
						var min = this.validates[prop].length.minimum;
						var max = this.validates[prop].length.maximum;
						if(min) {
							if(this[prop] && this[prop].length > min) {
							} else {
								bool = false;
								errors.push(prop + ' should be more than ' + min + ' chars');	
							}
							
						}
						if(max) {
							if(this[prop] && this[prop].length < max) {
							} else {
								bool = false;
								errors.push(prop + ' should be less than ' + max + ' chars');	
							}
							
						}
					}
					
				}
			}
			this.errors = errors;
			
			return bool;
		}
		// the clone method which does what its name suggests
		this.clone = function() {
			return this;
		}
		// the delete method deletes the row from the table identified this instance
		this.delete = function() {
			return dbase.deleteRecord(this.table_name,this);
		}
		// the update method updates the row with the modifications present in this instance
		this.update = function() {
			return dbase.updateRecord(this.table_name,this);
		}
		// the toJSON methods converts this instance to JSON and returns it
		this.toJSON = function() {

			var schema = require(process.cwd() + '/db/' + this.table_name + '_schema.js').schema;

			var obj = {};

			for(var attr in schema) {
				obj[attr] = this[attr];
			}
			return JSON.stringify(obj);
		}
		// the toXML methods converts this instance to XML and returns it
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
	// The model class function which has the class methods for the model
	function modelClass(tableName,props) {

		this.table_name = tableName;
		this.properties = props;
		var model = require(process.cwd() + '/app/models/' + this.table_name + '.js');
		
		for(var m in model[this.table_name]) {
			this[m] = model[this.table_name][m];
		}
		
		// utility function to convert a raw table row to model instance object
		function rowToModelInstance(tableName,row) {
			var obj = new modelInstance(tableName,this.properties,row);
			
			return obj;
		}
		// utility function to convert a raw table row array to model instance object array
		function rowsToModelInstances(tableName,rows) {
			var objs = [];
			for(var row in rows) {
				var obj = rowToModelInstance(tableName,rows[row]);
				objs.push(obj);
			}
			return objs;
		}

		// the new method which returns an empty model instance
		this.new = function() {
			return new modelInstance(this.table_name,this.properties);
		}
		// the create method creates a model instance with the values passed and saves it
		// and returns the model instance
		this.create = function(obj) {
			var m = new modelInstance(this.table_name,this.properties,obj);
			m.save();
			return m;
		}
		// the all method returns an array of model instances with all the rows in the table
		this.all = function() {
			
			var r = dbase.all(this.table_name);
			
			return rowsToModelInstances(tableName,r);
		}
		// the where method queries the db for the values specified by obj and returns the
		// resultant model instances in an array
		this.where = function(obj) {
			var r = dbase.where(this.table_name,obj);
		
			return rowsToModelInstances(tableName,r);
		}
		// the delete method deletes a row in the table with the id
		this.delete = function(id) {
			dbase.deleteRowsWithId(this.table_name,id);
		}
		// the deleteAll method deletes all the rows in the table
		this.deleteAll = function() {
			dbase.deleteAll(this.table_name);
		}
		// the find method finds a row in the table with the id if not found return null
		this.find = function(id) {
			
			var r = dbase.findRowsWithId(this.table_name,id);
			if(r[0] == undefined) {
				return null;
			}
			return rowToModelInstance(this.table_name,r[0]);
		}
		// the bind by method finds rows in the table with the field and value
		this.findBy = function(key,value) {
			var r = dbase.findRowsWithProp(this.table_name,key,value);
			if(r == []) {
				return null;
			}
			return rowsToModelInstances(this.table_name,r)
		}
		
		//the first method finds the first row in the table and returns the model instance
		this.first = function() {
			var r = dbase.findFirstRow(this.table_name);
			return rowToModelInstance(tableName,r);
		}
		//the last method finds the first row in the table and returns the model instance
		this.last = function() {
			dbase.findLastRow(this.table_name);
			return rowToModelInstance(tableName,r);
		}
	}
	// create model classes for all the models found in the aplication
	for(var m in mods) {
		modelClasses[mods[m]] = new modelClass(mods[m],modelSchemas[mods[m]]);
	}
	return modelClasses;
}
