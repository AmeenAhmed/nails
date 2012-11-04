// @Author : Ameen Ahmed
// router.js :
// This file is resposible for the routing. It finds the route.js file and compiles the routes.
// once it finds the routes it passses the request to dispatch



var ejs = require('ejs');
var fs = require('fs');
var log = require('./../log');
var dispatcher = require('./dispatcher');
var dbase = require('./dbase');
var helpers = require('./helpers');
var exceptions = require('./exceptions');
var utils = require('./utils');
var util = require('util');

// function	: 	initialize
// args 	: 	the routes object got from the route file
// returns	: 	the named_routes object which contains the functions for the named routes
// desc 	: 	checks for resources in the routes and adds all the resourceful routes before it is passed to the router
//				and also creates the named route functions 
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

// function	: 	route
// args		: 	url => url hit by the browser
//				method => POST | GET
//				query => query string if any
//				req => request object
//				res => response object
//				session => session hash found in the cookies
// returns	: 	nothing
// desc		: 	The main route function which is responsible for finding the routes and take the 
//				necessary actions
exports.route = function(url,method,query,req,res,session) {
	// remove the trailing slash found in the url [ http://localhost:3000/home/ =>  http://localhost:3000/home ]
	if(url != '/') {
		url = utils.removeTrailingSlash(url);	
	}
	
	
	// retrieve the route file
	var route_file = require(process.cwd() + '/config/routes.js');
	// call the initialize function and add a couple of routes for the resource and also get the route helpers
	var route_helpers = initialize(route_file.routes);
	
	method = method.toLowerCase();
	
	log.info('[' + req.method + '] ' + req.url);
	var params = {};
	// parse the query string and return the params as an object
	if(query) {
		params = utils.queryParser(query);
	}
	// hidden field _method for PUT | DELETE since the browser doesn't support them
	if(params['_method']) {
		method = params['_method'];		
	}
	// if the request is for a js/css/image files return the file, if not found return 404
	if(url.match('.js')) {
		if(fs.existsSync(process.cwd() + '/public/js' + url)) {
			log.info('Served asset '+ process.cwd() + '/public/js' + url);
			res.setHeader('Content-Type','text/javascript');
			res.end(fs.readFileSync(process.cwd() + '/public/js' + url,'utf-8'));
		} else {
			res.statusCode = 404;
			res.end();
		}
		return;
	}else if(url.match('.css')) {
		if(fs.existsSync(process.cwd() + '/public/css' + url)) {
			log.info('Served asset '+ process.cwd() + '/public/css' + url);
			res.setHeader('Content-Type','text/css');
			res.end(fs.readFileSync(process.cwd() + '/public/css' + url,'utf-8'));
		} else {
			res.statusCode = 404;
			res.end();
		}
		return;
	} else if(url.match('.png') || url.match('.gif') || url.match('.jpg') || url.match('.jpeg')){
		if(fs.existsSync(process.cwd() + '/public/images' + url)) {
			log.info('Served asset '+ process.cwd() + '/public/images' + url);
			var extension = url.split('.')[1];
			
			res.setHeader('Content-Type','image/' + extension);
			res.end(fs.readFileSync(process.cwd() + '/public/images' + url));
		} else {
			res.statusCode = 404;
			res.end();
		}	
		return;
	}
	
	// if the url is root i.e "/"
	if(url == '/') {
		var route = '';
		// if a "root" route is specified get the route else check for the static index.html file
		// if index.html is found return the file
		// if index.html is not found then return noRouteMatchException
		
		if(route_file.routes.root) {
			route = route_file.routes.root;
		} else {
			if(fs.existsSync(process.cwd() + '/public/index.html','utf-8')) {
				log.info('Served /public/index.html');
				res.end(fs.readFileSync(process.cwd() + '/public/index.html','utf-8'));
				return;
			} else {
				log.error('No route matching [' + method + '] ' + url);
				res.end(exceptions.noRouteMatch(method,url));
				return;
			}
		}
		// call the route request function to find the controller and action and send for dispatch
		return routeRequest(route,url,method,params,req,res,route_helpers,session);
	}
	// if the route for the url is found in the routes file
	else if(route_file.routes[utils.removeLeadingSlash(url)]) {
		var route = route_file.routes[utils.removeLeadingSlash(url)];
		// call route reuqest with the found route
		return routeRequest(route,url,method,params,req,res,route_helpers,session);
	}
	// if route for the url is not found in the route file may be it the url has a param
	// eg: http://localhost/products/12 => [route] products/:id
	// if such a route with param match is found find the route and call route request with the route 
	else {
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
					
					return routeRequest(routeVal,url,method,params,req,res,route_helpers,session);
					break;
				}
			}
		}
		// If all fails then log the no route match exception and return the same to the browser
		log.error('No route matching [' + method + '] ' + url);
		res.end(exceptions.noRouteMatch(method,url));
	}	
		
}


// function	: 	routeRequest
// args		: 	same as the route function with an extra route_helpers arg, which is the named routes functions
// returns	: 	nothing
// desc		: 	get the route and find the controller and action
//				if found send this info to the dispatcher else log error


function routeRequest(route,url,method,params,req,res,route_helpers,session) {
	var controllerName = '';
	var actionName = '';
	method = method.toLowerCase();
	// Find the contoller and action if the route with the method is found in the routes file
	if(route.match) { 
		if(route.via && route.via.indexOf(method) == -1) {
			res.end(exceptions.noRouteMatch(method,url));
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
		res.end(exceptions.noRouteMatch(method,url));
	}
	log.info('Found route => ' + controllerName + '#' + actionName + ' [' + method.toUpperCase() + ']');
	// call the dispatcher with the controller name and action name to execute
	return dispatcher.runAndRender(controllerName,actionName,url,params,req,res,route_helpers,session);
}