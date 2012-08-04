var ejs = require('ejs');
var fs = require('fs');

exports.route = function(url) {
	var route_file = require(process.cwd() + '/config/routes.js');
	if(url == '/') {
		var route = '';
		if(route_file.routes[url]) {
			console.log('Route match : ' + route_file.routes[url]);
			route = route_file[url];
		} else if(route_file.routes.root) {
			console.log('Route match : ' + route_file.routes.root);
			route = route_file.routes.root;
		} else {
			return fs.readFileSync(process.cwd() + '/public/index.html');

		}
		var tokens = route.split('#');
		//if(tokens.length > 2) {
		//	console.log()
		//}

	}
	else if(route_file.routes[url]) {
		// console.log('route match');
		// var route = route_file.routes[url];
		// var tokens = route.split('#');
		// console.log(tokens);
		// var controller = require(process.cwd() + '/' + tokens[0] + '.js');
		// controller[tokens[0]].data = {};
		// controller[tokens[0]][tokens[1]]();
		// return ejs.render(fs.readFileSync(process.cwd() +'/'+ tokens[1] +'_view.js','utf-8'),
		// 		{data:controller[tokens[0]].data});
	} else {
		if(url == '/') {
			if(fs.existsSync(process.cwd() + '/public/index.html')) {
				return fs.readFileSync(process.cwd() + '/public/index.html');
			} else {
				//return fs.readFileSync(process.cwd() + '/public/404.html'); 
				return '<h1>No route matches ' + url + '</h1>'
			}
		} else {
			//return fs.readFileSync(process.cwd() + '/public/404.html'); 
			return '<h1>No route matches ' + url + '</h1>'
		}
		console.log('no route ' + url);
	}
}