var ejs = require('ejs');
var fs = require('fs');
var log = require('./../log');
var dispatcher = require('./dispatcher');
var dbase = require('./dbase');
var helpers = require('./helpers');
var exceptions = require('./exceptions');
var utils = require('./utils');

function initialize(routes) {
	var named_routes = {};
	console.log(routes);
	for(var key in routes) {
		
		if(routes[key].match == 'resource') {
			
			console.log('resource found : ' + key);
			routes[key] = {get:key+'#index', post:key+'#create'};
			routes[key+'/new'] = {get:key+'#new'};
			routes[key+'/:id'] = {get:key+'#show', put:key+'#update', delete:key+'#destroy'};
			routes[key+'/:id/edit'] = {get:key+'#edit'};

			named_routes[key + '_path'] = utils.createRouteHelper('/' + key);
			named_routes['new_' + key + '_path'] = utils.createRouteHelper('/' + key + '/new');
			named_routes['edit_' + key + '_path(:id)'] = utils.createRouteHelper('/' + key + '/:id/edit');
				
			
		} else if(routes[key]['as']) {
			console.log('We have an as : ' + routes[key].as);
			var route = key;
			var helper_method = routes[key].as;
			named_routes[helper_method + '_path'] = utils.createRouteHelper('/' + route);
		} else if(!key.match(':')) {
			var route = key;
			var parts = key.split('/');
			var helper_method = '';
			for(var i=0;i<parts.length-1;i++) {
				helper_method += parts[i] + '_';
			}
			helper_method += parts[i];
			named_routes[helper_method] = utils.createRouteHelper('/' + key);
		}
	}
	console.log('****************************************');
	console.log(named_routes);
	console.log('****************************************');
	return named_routes;
}


exports.route = function(url,method,query,req,res) {
	
	var route_file = require(process.cwd() + '/config/routes.js');
	var route_helpers = initialize(route_file.routes);
	method = method.toLowerCase();
	var params = {};
	if(query) {
		params = utils.queryParser(query);
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
			if(fs.existsSync(process.cwd() + '/public/index.html','utf-8')) {
				return fs.readFileSync(process.cwd() + '/public/index.html','utf-8');
			} else {
				response.end(exceptions.noRouteMatch(method,url));
			}
		}
		
		return routeRequest(route,url,method,params,req,res,route_helpers);
	}
	else if(route_file.routes[utils.removeLeadingSlash(url)]) {
		var route = route_file.routes[utils.removeLeadingSlash(url)];
		return routeRequest(route,url,method,params,req,res,route_helpers);
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
			res.end(exceptions.noRouteMatch(method,url));
		} 

		// console.log(route_file.routes[rIndex]);
		// var routeSplit = rIndex.split('/');
		// var route = route_file.routes[rIndex];
		// for(var i=0;i<routeSplit.length;i++) {
		// 	//console.log(routeSplit[i].match(':'));
		// 	if(routeSplit[i].match(':')) {
		// 		var param = urlSplit[i+1];
		// 		var key = routeSplit[i].replace(':','');
		// 		params[key] = param;
		// 		console.log(params);
		// 		//console.log(key + ':' + param);
		// 		return routeRequest(route,url,method,params,req,res,route_helpers);
		// 	}
		// }

		res.end(exceptions.noRouteMatch(method,url));
		console.log('no route ' + url);
	}	
		
}





function routeRequest(route,url,method,params,req,res,route_helpers) {
	var controllerName = '';
	var actionName = '';
	if(route.match) { 
		console.log('Method match is found');
		if(route.via && route.via.indexOf(method) == -1) {
			return exceptions.noRouteMatch(method,url);
		} 
		controllerName = utils.controllerFromRoute(route.match);
		actionName = utils.actionFromRoute(route.match);
		console.log(controllerName+'@'+actionName);
	} else if(route.get && method == 'get') {
		controllerName = utils.controllerFromRoute(route.get);
		actionName = utils.actionFromRoute(route.get);
	} else if(route.post && method == 'post') {
		controllerName = utils.controllerFromRoute(route.post);
		actionName = utils.actionFromRoute(route.post);
	} else if(route.put && method == 'put') {
		controllerName = utils.controllerFromRoute(route.put);
		actionName = utils.actionFromRoute(route.put);

	} else if(route.delete && method == 'delete') {
		controllerName = utils.controllerFromRoute(route.delete);
		actionName = utils.actionFromRoute(route.delete);		
	} else {
		return exceptions.noRouteMatch(method,url);
	}

	log.info('Found route ' + route);
	return dispatcher.runAndRender(controllerName,actionName,url,params,req,res,route_helpers);
}