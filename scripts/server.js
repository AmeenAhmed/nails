



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
		var reqUrl = url.parse(req.url); 
		console.log('path : '+reqUrl.pathname);
		console.log('query : '+reqUrl.query);
		var response = router.route(reqUrl.pathname,req.method,reqUrl.query);
		if(response == '404') {
			res.statusCode = 404;
			response = '';
		}
		res.end(response);
	}).listen(8080,'127.0.0.1');	
}
