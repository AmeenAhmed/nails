var fs = require('fs');
var ejs = require('ejs');
var helpers = require('./helpers');
var vm = require('vm');
var exceptions = require('./exceptions');
var utils = require('./utils');

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
	context.data = {};
	context.params = params;
	context.redirect_to = helpers.redirect_to;
	
	for(var key in route_helpers) {
		context[key] = route_helpers[key];
	}	


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
		return exceptions.unknownAction(actionName,controllerName);
	}
	var viewFileName = process.cwd() +'/app/views/'+controllerName+'/'+ actionName +'.html.ejs';
	var layoutName = process.cwd() + '/app/views/layouts/application.html.ejs';

	var viewContext = {};
	viewContext['data'] = context.data;

	for(var key in route_helpers) {
		viewContext[key] = route_helpers[key];
	}	

	if(fs.existsSync(viewFileName)) {
		return  html = ejs.render(fs.readFileSync(layoutName,'utf-8'), {yield : function() {
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
	} else {
		return exceptions.templateMissing(utils.removeLeadingSlash(url));
	}
}
