



exports.start_server = function() {
	var http = require('http');
	
	http.createServer(function(req,res) {
		console.log(req.url);
		//res.end(req.url);
		 mod = require.resolve(process.env["NAILS_PATH"] + '/scripts/router.js');
		// routesMod = require.resolve(process.cwd() + '/config/routes.js');
		// delete require.cache[mod];
		// delete require.cache[routesMod];
		console.log(require('module')._cache={});
		console.log(require('module')._cache);		
		//delete require.cache[key];
		
		//console.log(require.cache);
		var router = require(process.env["NAILS_PATH"] + '/scripts/router.js');
		res.end(router.route(req.url,req.method));
	}).listen(8080,'127.0.0.1');	
}
