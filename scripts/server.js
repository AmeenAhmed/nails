// @Author : Ameen Ahmed
// server.js :
// This file containes the server code which is called by $ nails server

// function : start_server
// args : nil
// desc : creates and starts the http server

exports.start_server = function() {
	
	var http = require('http');
	var url = require('url');
	var Fiber = require('fibers');
	var util = require('util');
	var crypto = require('crypto');
	var cookies = require('./cookies');
	var log = require('./../log');

	// loading configs from the application.js file
	var config = require(process.cwd() + '/config/application.js').config;
	// port number to be used to start the server
	var port = config.server.port;
	
	process.on('uncaughtException', function(err) {
		log.error(err.message);
					
		res.end(err.stack);
	});
	// creating the server and listening to the port
	var server = http.createServer(function(req,res) {
		try {
			// create a fiber to get rid of the PYRAMID OF DOOM
			Fiber(function() {
				// Create the session using cookies 
				cookies.createSession(req,res);
				// get the session hash which stores the session vars
				var session = cookies.getSessionHash(req,res,'session');
				
				// catches the exception and prints to the log and returns the stack trace
				// back to the browser 
				
				
				//clear the cache when a request is served. required for the hot swapping of code
				require('module')._cache={};
				
				
				// get the file router.js to call the route function
				var router = require(process.env["NAILS_PATH"] + '/scripts/router.js');
				
				// if the request is a GET reqest just parse the url for params
				// if the request is a POST request wait for the data to arrive and 
				// accumulate the params and then parse it.
				if(req.method == 'GET') {
					// parse the request string to seperate params and the url
					var reqUrl = url.parse(req.url); 
					// call the router route function with the url, method, params,
					// the request object, the response object and the session hash 
					var response = router.route(reqUrl.pathname,req.method,reqUrl.query,req,res,session);
					
				} else if(req.method == 'POST') {
					
					var postData = '';
					// acumulate the query string data in the postData var
					req.on('data',function(chunk) {
					
						postData += chunk;
					});
		
					req.on('end',function() {
						// create the fiber here because the callback is placed in the event queue 
						Fiber(function() {
							// call the route function
							router.route(req.url,req.method,postData,req,res,session);	
						}).run();
						
					});
				}
			}).run();
		} catch(exception) {
			log.error(exception);
		}
		
	}).listen(port); // listen to the port number in the application.js config file
	
}
