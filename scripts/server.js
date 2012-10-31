
exports.start_server = function() {
	var http = require('http');
	var url = require('url');
	var Fiber = require('fibers');
	var util = require('util');
	var crypto = require('crypto');
	var cookies = require('./cookies');
	var server = http.createServer(function(req,res) {
		Fiber(function() { 
			cookies.createSession(req,res);
			var session = cookies.getSessionHash(req,res,'session');
			
			//process.on('uncaughtException', function(err) {
			//	console.log(err.message);
				
			//	res.end(err.stack);
			//});
			require('module')._cache={};
			
			//global.callbackCount = 0;
			
			var router = require(process.env["NAILS_PATH"] + '/scripts/router.js');
			
			if(req.method == 'GET') {
				//console.log('Request method : ' + req.method);
				var reqUrl = url.parse(req.url); 
				var response = router.route(reqUrl.pathname,req.method,reqUrl.query,req,res,session);
				
			} else if(req.method == 'POST') {
				//console.log('Request method : ' + req.method);
				var postData = '';
				req.on('data',function(chunk) {
				
					postData += chunk;
				});
	
				req.on('end',function() {
				
					router.route(req.url,req.method,postData,req,res,session);
				});
			}
		}).run();
	}).listen(3000);
}
