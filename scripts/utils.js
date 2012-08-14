exports.queryParser = function (query) {
	var obj = {};

	var params = query.split('&');

	for(var i=0;i<params.length;i++) {
		obj['_'+params[i].split('=')[0]] = params[i].split('=')[1];
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