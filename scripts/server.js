



exports.start_server = function() {
	var http = require('http');
	var url = require('url');
	http.createServer(function(req,res) {
		console.log(req.url);
		//res.end(req.url);
		 mod = require.resolve(process.env["NAILS_PATH"] + '/scripts/router.js');
		// routesMod = require.resolve(process.cwd() + '/config/routes.js');
		// delete require.cache[mod];
		// delete require.cache[routesMod];
		require('module')._cache={};
		//delete require.cache[key];
		
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
			var response = router.route(reqUrl.pathname,req.method,reqUrl.query);
			
			res.end(response);
		} else if(req.method == 'POST' || req.method == 'PUT') {
			var postData = '';
			req.on('data',function(chunk) {
				console.log('incoming data : ' + chunk);
				postData += chunk;
			});

			req.on('end',function() {
				console.log('postData :' + postData);
				var response = router.route(req.url,req.method,postData);
				console.log('post data end');
				res.end(response);
			});
		}
	}).listen(8080,'127.0.0.1');	
}
