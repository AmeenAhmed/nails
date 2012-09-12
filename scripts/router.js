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
	
	for(var key in routes) {
		
		if(routes[key].match == 'resource') {
			
			
			routes[key] = {get:key+'#index', post:key+'#create'};
			routes[key+'/new'] = {get:key+'#new'};
			routes[key+'/:id'] = {get:key+'#show', put:key+'#update', delete:key+'#destroy'};
			routes[key+'/:id/edit'] = {get:key+'#edit'};

			named_routes[key + '_path'] = utils.createRouteHelper('/' + key);
			named_routes['new_' + key + '_path'] = utils.createRouteHelper('/' + key + '/new');
			named_routes['edit_' + key + '_path(:id)'] = utils.createRouteHelper('/' + key + '/:id/edit');
				
			
		} else if(routes[key]['as']) {
			
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
		if(fs.existsSync(process.cwd() + '/public/js' + url)) {
			res.setHeader('Content-Type','text/javascript');
			res.end(fs.readFileSync(process.cwd() + '/public/js' + url,'utf-8'));
		} else {
			res.statusCode = 404;
			res.end();
		}
	}
	if(url.match('.css')) {
		if(fs.existsSync(process.cwd() + '/public/css' + url)) {
			res.setHeader('Content-Type','text/css');
			res.end(fs.readFileSync(process.cwd() + '/public/css' + url,'utf-8'));
		} else {
			res.statusCode = 404;
			res.end();
		}	
	}
	if(url == '/') {
		var route = '';
		if(route_file.routes.root) {
			route = route_file.routes.root;
		} else {
			if(fs.existsSync(process.cwd() + '/public/index.html','utf-8')) {
				res.end(fs.readFileSync(process.cwd() + '/public/index.html','utf-8'));
			} else {
				res.end(exceptions.noRouteMatch(method,url));
			}
		}
		
		return routeRequest(route,url,method,params,req,res,route_helpers);
	}
	else if(route_file.routes[utils.removeLeadingSlash(url)]) {
		var route = route_file.routes[utils.removeLeadingSlash(url)];
		return routeRequest(route,url,method,params,req,res,route_helpers);
	} else {
		url = utils.removeLeadingSlash(url);
		var c1 = url.split('/').length;
		var done = false;
		var routes = route_file.routes;
		var urlSplit = url.split('/');
		
		for(var route in routes) {
			var c2 = route.split('/').length;
			var routeSplit = route.split('/');
			var routeVal = undefined;
			if(c1 == c2) {
				var bool = true;
				
				for(var x in urlSplit) {
					if(urlSplit[x] != routeSplit[x] && !routeSplit[x].match(':')) {
						bool = false;
						
						break;
					}
				}
				
				if(bool) {
					routeVal = routes[route];
					for(x in routeSplit) {
						if(routeSplit[x].match(':')) {
							var key = routeSplit[x].replace(':','');
							var value = urlSplit[x];
							params[key] = value;
						}
					}
					console.log(params);
					return routeRequest(routeVal,url,method,params,req,res,route_helpers);
					break;
				}
			}
		}
		
		res.end(exceptions.noRouteMatch(method,url));
	}	
		
}





function routeRequest(route,url,method,params,req,res,route_helpers) {
	var controllerName = '';
	var actionName = '';
	if(route.match) { 
		if(route.via && route.via.indexOf(method) == -1) {
			return exceptions.noRouteMatch(method,url);
		} 
		controllerName = utils.controllerFromRoute(route.match);
		actionName = utils.actionFromRoute(route.match);
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
	return dispatcher.runAndRender(controllerName,actionName,url,params,req,res,route_helpers);
}