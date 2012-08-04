



exports.start_server = function() {
	var http = require('http');
	
	http.createServer(function(req,res) {
		console.log(req.url);
		//res.end(req.url);
		mod = require.resolve(process.env["NAILS_PATH"] + '/scripts/router.js');
		delete require.cache[mod];
		//console.log(require.cache);
		var router = require(process.env["NAILS_PATH"] + '/scripts/router.js');
		res.end(router.route(req.url));
	}).listen(3000,'127.0.0.1');	
}
