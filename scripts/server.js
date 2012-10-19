
exports.start_server = function() {
	var http = require('http');
	var url = require('url');
	var Fiber = require('fibers');
	var util = require('util');
	var crypto = require('crypto');
	http.createServer(function(req,res) {
		Fiber(function() { 
			cookies = {}
			var c = req.headers.cookie.split(';');
			for(var i=0; i<c.length; i++) {
				var cks = c[i].split('=');
				cookies[cks[0].trim()] = cks[1];
			}

			console.log('Cookies: ' + util.inspect(cookies));
			//res.setHeader('Set-Cookie','user=123');
			process.on('uncaughtException', function(err) {
				console.log(err.message);
				
				res.end(err.stack);
			});
			require('module')._cache={};
			
			global.callbackCount = 0;
			
			var router = require(process.env["NAILS_PATH"] + '/scripts/router.js');
			
			if(req.method == 'GET' || req.method == 'DELETE') {
				console.log('Request method : ' + req.method);
				var reqUrl = url.parse(req.url); 
				var response = router.route(reqUrl.pathname,req.method,reqUrl.query,req,res);
				
			} else if(req.method == 'POST' || req.method == 'PUT') {
				console.log('Request method : ' + req.method);
				var postData = '';
				req.on('data',function(chunk) {
				
					postData += chunk;
				});
	
				req.on('end',function() {
				
					router.route(req.url,req.method,postData,req,res);
				});
			}
		}).run();
	}).listen(8080,'127.0.0.1');	
}
