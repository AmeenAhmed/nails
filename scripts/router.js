var ejs = require('ejs');
var fs = require('fs');
var log = require('./../log');
var dispatcher = require('./dispatcher');
var dbase = require('./dbase');
var helpers = require('./helpers');

function initialize(routes) {

	for(var key in routes) {
		
		if(routes[key].match) {
			if(routes[key].match == 'resource') {
				console.log('resource found : ' + key);
				routes[key] = {get:key+'#index', post:key+'#create'};
				routes[key+'/new'] = {get:key+'#new'};
				routes[key+'/:id'] = {get:key+'#show', put:key+'#update', delete:key+'#destroy'};
				routes[key+'/:id/edit'] = {get:key+'#edit'};
				
			}
		}
	}


}

exports.route = function(url,method,query,token) {
	
	var route_file = require(process.cwd() + '/config/routes.js');
	initialize(route_file.routes);
	method = method.toLowerCase();
	var params = {};
	if(query) {
		params = queryParser(query);
	}

	if(url.match('.js')) {
		console.log(url + ' js called!');
		if(fs.existsSync(process.cwd() + '/public/js' + url)) {
			return fs.readFileSync(process.cwd() + '/public/js' + url,'utf-8');
		} else {
			return '404';
		}
	}
	if(url.match('.css')) {
		if(fs.existsSync(process.cwd() + '/public/css' + url)) {
			return fs.readFileSync(process.cwd() + '/public/css' + url,'utf-8');
		} else {
			return '404';
		}	
	}
	if(url == '/') {
		var route = '';
		console.log(route_file);
		if(route_file.routes.root) {
			console.log('Route match : ' + route_file.routes.root);
			route = route_file.routes.root;
		} else {
			return fs.readFileSync(process.cwd() + '/public/index.html');
		}
		
		return routeRequest(route,url,method,params,token);
	}
	else if(route_file.routes[removeLeadingSlash(url)]) {
		var route = route_file.routes[removeLeadingSlash(url)];
		return routeRequest(route,url,method,params,token);
	} else {
		var urlSplit = url.split('/');
		var rIndex = null;
		console.log(urlSplit);
		for(var r in route_file.routes) {

			if(urlSplit.length-1 != r.split("/").length) {
				continue;
			}
			console.log('Hurray got here : urlSplit : '+urlSplit);
			if(r.split('/')[1]) {
				console.log('r.split(\'/\')[1].match(\':\')  : '+r.split('/')[1].match(':'));
			}
			if(urlSplit[1].length > 0 && r.match(urlSplit[1]+'/') && r.split('/')[1].match(':')	) {
				//console.log('match!')
				rIndex = r; 
				console.log('Found with id');
				break;
			}
		}

		if(rIndex == null) {
			return noRouteMatch(method,url);
		} 

		console.log(route_file.routes[rIndex]);
		var routeSplit = rIndex.split('/');
		var route = route_file.routes[rIndex];
		for(var i=0;i<routeSplit.length;i++) {
			//console.log(routeSplit[i].match(':'));
			if(routeSplit[i].match(':')) {
				var param = urlSplit[i+1];
				var key = routeSplit[i].replace(':','');
				params[key] = param;
				console.log(params);
				//console.log(key + ':' + param);
				return routeRequest(route,url,method,params,token);
			}
		}

		return noRouteMatch(method,url);
		console.log('no route ' + url);
	}	
		
}
function queryParser(query) {
	var obj = {};

	var params = query.split('&');

	for(var i=0;i<params.length;i++) {
		obj['_'+params[i].split('=')[0]] = params[i].split('=')[1];
	}
	return obj;
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
			'<p>The action \''+action+'\' could not be found for '+controller+'_controller</p>';
}
function noController(controller) {
	return '<h1>Routing Error</h1>' + 
			'<p>The controller ' + controller + ' could not be found'
}
function noRouteMatch(method,url) {
	return '<h1>Routing Error</h1>' + 
				'<p>No route macthes ['+method.toUpperCase()+'] "'+url+'"</p>';
}


function routeRequest(route,url,method,params,token) {
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
		controllerName = controllerFromRoute(route.post);
		actionName = actionFromRoute(route.post);
	} else if(route.put && method == 'put') {
		controllerName = controllerFromRoute(route.put);
		actionName = actionFromRoute(route.put);

	} else if(route.delete && method == 'delete') {
		controllerName = controllerFromRoute(route.delete);
		actionName = actionFromRoute(route.delete);		
	} else {
		return noRouteMatch(method,url);
	}

	log.info('Found route ' + route);
	return dispatcher.runAndRender(controllerName,actionName,url,params,token);
}