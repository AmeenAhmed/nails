var ejs = require('ejs');
var fs = require('fs');
var log = require('./../log');
exports.route = function(url,method) {
	var route_file = require(process.cwd() + '/config/routes.js');
	method = method.toLowerCase();
	if(url == '/') {
		var route = '';
		console.log(route_file);
		if(route_file.routes.root) {
			console.log('Route match : ' + route_file.routes.root);
			route = route_file.routes.root;
		} else {
			return fs.readFileSync(process.cwd() + '/public/index.html');
		}
		
		return routeRequest(route,url,method);
	}
	else if(route_file.routes[removeLeadingSlash(url)]) {
		// console.log('route match');
		// var route = route_file.routes[url];
		// var tokens = route.split('#');
		// console.log(tokens);
		// var controller = require(process.cwd() + '/' + tokens[0] + '.js');
		// controller[tokens[0]].data = {};
		// controller[tokens[0]][tokens[1]]();
		// return ejs.render(fs.readFileSync(process.cwd() +'/'+ tokens[1] +'_view.js','utf-8'),
		// 		{data:controller[tokens[0]].data});
		
		var route = route_file.routes[removeLeadingSlash(url)];
		return routeRequest(route,url,method);
	} else {
		return noRouteMatch(method,url);
		console.log('no route ' + url);
	}	
		
}

function addLeadingSlash(str) {
	if(str[0] != '/') {
		return '/' + str;
	}
	return str;
}

function removeLeadingSlash(str) {
	if(str[0] == '/') {
		return str.replace('/',''); 
	}	
	return str;
}

function controllerFromRoute(r) {
	var tokens = r.split('#');
	return tokens[0];
}

function actionFromRoute(r) {
	var tokens = r.split('#');
	return tokens[1];
}

function templateMissing(url) {
	return '<h1>Template is Missing</h1>' +
			'<p>Missing template '+url+', Searched in : '+process.cwd()+'/app/views</p>';
}
function unknownAction(action,controller) {
	return '<h1>Unknown Action</h1>' +
			'<p>The action \''+action+'\' could not be found for '+controller+'Controller</p>';
}
function noController(controller) {
	return '<h1>Routing Error</h1>' + 
			'<p>The controller ' + controller + ' could not be found'
}
function noRouteMatch(method,url) {
	return '<h1>Routing Error</h1>' + 
				'<p>No route macthes ['+method.toUpperCase()+'] "'+url+'"</p>';
}
function runAndRender(controllerName,actionName) {
	if(!fs.existsSync(process.cwd() + '/app/controllers/' + controllerName + '_controller.js')) {
		return noController(controllerName+'_controller');
	}
	var controller = require(process.cwd() + '/app/controllers/' + controllerName + '_controller.js');
	controller[controllerName].data = {};
	if(controller[controllerName][actionName]) {
		controller[controllerName][actionName]();
	} else {
		return unknownAction(actionName,controllerName);
	}
	var viewFileName = process.cwd() +'/app/views/'+controllerName+'/'+ actionName +'.html.ejs';
	var layoutName = process.cwd() + '/app/views/layouts/application.html.ejs';
	if(fs.existsSync(viewFileName)) {
		return  html = ejs.render(fs.readFileSync(layoutName,'utf-8'), {yield : function() {
			return ejs.render(fs.readFileSync(viewFileName,'utf-8'), {data:controller[controllerName].data});
		}});
		//return ejs.render(fs.readFileSync(viewFileName,'utf-8'), {data:controller[controllerName].data});
	} else {
		return templateMissing(removeLeadingSlash(url));
	}
}

function routeRequest(route,url,method) {
	var controllerName = '';
	var actionName = '';
	if(route.match) { 
		console.log('Method match is found');
		if(route.via && route.via.indexOf(method) == -1) {
			return noRouteMatch(method,url);
		} 
		controllerName = controllerFromRoute(route.match);
		actionName = actionFromRoute(route.match);
		console.log(controllerName+'@'+actionName);
	} else if(route.get && method == 'get') {
		controllerName = controllerFromRoute(route.get);
		actionName = actionFromRoute(route.get);
	} else if(route.post && method == 'post') {
		actionName = actionFromRoute(route.post);
	} else {
		return noRouteMatch(method,url);
	}

	log.info('Found route ' + route);
	return runAndRender(controllerName,actionName);
}