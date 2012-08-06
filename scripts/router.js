var ejs = require('ejs');
var fs = require('fs');
var log = require('./../log');
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
	else if(route_file.routes[removeLeadingSlash(url)]) {
		// console.log('route match');
		// var route = route_file.routes[url];
		// var tokens = route.split('#');
		// console.log(tokens);
		// var controller = require(process.cwd() + '/' + tokens[0] + '.js');
		// controller[tokens[0]].data = {};
		// controller[tokens[0]][tokens[1]]();
		// return ejs.render(fs.readFileSync(process.cwd() +'/'+ tokens[1] +'_view.js','utf-8'),
		// 		{data:controller[tokens[0]].data});
		
		var route = route_file.routes[removeLeadingSlash(url)];
		log.info('Found route ' + route);
		var controllerName = controllerFromRoute(route);
		var actionName = actionFromRoute(route);
		var controller = require(process.cwd() + '/app/controllers/' + controllerName + '_controller.js');
		controller[controllerName].data = {};
		if(controller[controllerName][actionName]) {
			controller[controllerName][actionName]();
		} else {
			return unknownAction(actionName,controllerName);
		}
		var viewFileName = process.cwd() +'/app/views/'+controllerName+'/'+ actionName +'.html.ejs';
		if(fs.existsSync(viewFileName)) {
			return ejs.render(fs.readFileSync(viewFileName,'utf-8'), {data:controller[controllerName].data});
		} else {
			return templateMissing(removeLeadingSlash(url));
		}
		
		return 'Route present ' + removeLeadingSlash(url);
	} else {
		return '<h1>Routing Error</h1>' + 
				'<p>No route macthes '+url+'</p>'
		console.log('no route ' + url);
	}
}

function addLeadingSlash(str) {
	if(str[0] != '/') {
		return '/' + str;
	}
	return str;
}

function removeLeadingSlash(str) {
	if(str[0] == '/') {
		return str.replace('/',''); 
	}	
	return str;
}

function controllerFromRoute(r) {
	var tokens = r.split('#');
	return tokens[0];
}

function actionFromRoute(r) {
	var tokens = r.split('#');
	return tokens[1];
}

function templateMissing(url) {
	return '<h1>Template is Missing</h1>' +
			'<p>Missing template '+url+', Searched in : '+process.cwd()+'/app/views</p>';
}
function unknownAction(action,controller) {
	return '<h1>Unknown Action</h1>' +
			'<p>The action \''+action+'\' could not be found for '+controller+'Controller</p>';
}