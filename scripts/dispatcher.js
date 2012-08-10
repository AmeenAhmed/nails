var fs = require('fs');
var ejs = require('ejs');
var helpers = require('./helpers');
exports.runAndRender = function(controllerName,actionName,url,params,token) {
	if(!fs.existsSync(process.cwd() + '/app/controllers/' + controllerName + '_controller.js')) {
		return noController(controllerName+'_controller');
	}

	var controller = require(process.cwd() + '/app/controllers/' + controllerName + '_controller.js');
	controller[controllerName].data = {};
	controller[controllerName].params = params
	controller[controllerName].token = token

	controller[controllerName].redirect_to = helpers.redirect_to;

	if(controller[controllerName][actionName]) {
		var res = controller[controllerName][actionName]();
		
	} else {
		return unknownAction(actionName,controllerName);
	}
	var viewFileName = process.cwd() +'/app/views/'+controllerName+'/'+ actionName +'.html.ejs';
	var layoutName = process.cwd() + '/app/views/layouts/application.html.ejs';
	if(fs.existsSync(viewFileName)) {
		return  html = ejs.render(fs.readFileSync(layoutName,'utf-8'), {yield : function() {
			return ejs.render(fs.readFileSync(viewFileName,'utf-8'), {data:controller[controllerName].data});
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
		return templateMissing(removeLeadingSlash(url));
	}
}
