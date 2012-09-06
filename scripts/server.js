
exports.start_server = function() {
	var http = require('http');
	var url = require('url');
	var Fiber = require('fibers');
	http.createServer(function(req,res) {
		Fiber(function() { 
		console.log(req.url);
		//res.end(req.url);
		 mod = require.resolve(process.env["NAILS_PATH"] + '/scripts/router.js');
		// routesMod = require.resolve(process.cwd() + '/config/routes.js');
		// delete require.cache[mod];
		// delete require.cache[routesMod];
		require('module')._cache={};
		//delete require.cache[key];
		global.callbackCount = 0;
		var token = '';

		for(var i=0;i<32;i++) {
			token += Math.floor(Math.random() * 10);
		}
		console.log('token : ' + token);

		global[token] = {};
		global[token].req = req;
		global[token].res = res;

		//console.log(require.cache);
		var router = require(process.env["NAILS_PATH"] + '/scripts/router.js');
		if(req.url.match('.js')) {
			res.setHeader('Content-Type','text/javascript');
		} else if(req.url.match('.css')) {
			res.setHeader('Content-Type','text/css');
		}
		if(response == '404') {
			res.statusCode = 404;
			response = '';
		}
		console.log("The http  method : " + req.method);
		if(req.method == 'GET' || req.method == 'DELETE') {
			var reqUrl = url.parse(req.url); 
			console.log('path : '+reqUrl.pathname);
			console.log('query : '+reqUrl.query);
			var response = router.route(reqUrl.pathname,req.method,reqUrl.query,req,res);
			// console.log('Response == ' + response);
			// if(response.split(' ')[0] == '302') {
			// 	res.statusCode = 302;
			// 	res.setHeader("Location", response.split(' ')[1]);
			// 	res.end();
			// } else {			
			// 	res.end(response);
			// }
		} else if(req.method == 'POST' || req.method == 'PUT') {
			var postData = '';
			req.on('data',function(chunk) {
				console.log('incoming data : ' + chunk);
				postData += chunk;
			});

			req.on('end',function() {
				console.log('postData :' + postData);
				var response = router.route(req.url,req.method,postData,req,res);
				console.log('post data end');
				res.end(response);
			});
		}
	}).run();
	}).listen(8080,'127.0.0.1');	
}
