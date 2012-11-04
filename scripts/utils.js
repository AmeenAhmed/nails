exports.queryParser = function (query) {
	var obj = {};

	var params = query.split('&');

	for(var i=0;i<params.length;i++) {
		params[i] = params[i].replace(/\+/g,' ');
		var key = params[i].split('=')[0];
		console.log('Key = ' + key);
		if(key.match('%5B')) {
			console.log('params : ' +  params[i].split('=')[1]);
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
exports.removeTrailingSlash = function(str) {
	var newStr = '';
	if(str[str.length-1] == '/') {
		for(var i=0;i<str.length-1;i++) {
			newStr += str[i]
		}
		return newStr;
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