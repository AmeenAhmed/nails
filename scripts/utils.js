exports.queryParser = function (query) {
	var obj = {};

	var params = query.split('&');

	for(var i=0;i<params.length;i++) {
		
		var key = params[i].split('=')[0];
		console.log('Key = ' + key);
		if(key.match('%5B')) {
			console.log('params : ' + key);
			if(!obj[key.split('%5B')[0]]) {
				obj[key.split('%5B')[0]] = {};
			}
			obj[key.split('%5B')[0]][key.split('%5B')[1].split('%5D')[0]] = params[i].split('=')[1];
		} else {
			obj[params[i].split('=')[0]] = params[i].split('=')[1];
		}
		
	}
	
	return obj;
}
exports.addLeadingSlash = function (str) {
	if(str[0] != '/') {
		return '/' + str;
	}
	return str;
}

exports.removeLeadingSlash = function (str) {
	if(str[0] == '/') {
		return str.replace('/',''); 
	}	
	return str;
}

exports.controllerFromRoute = function (r) {
	var tokens = r.split('#');
	return tokens[0];
}

exports.actionFromRoute = function (r) {
	var tokens = r.split('#');
	return tokens[1];
}

exports.createRouteHelper = function (path) {
	return function() { return path };
}