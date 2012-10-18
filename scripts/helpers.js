var util = require('util');
exports.redirectTo = function(url) {
	return { status: 302, response:url };
}

exports.render = function(obj) {
	console.log('Render : ' + util.inspect(obj));
	if(obj.json) {
		var model = obj.json;
		return {
			json: model.toJSON()
		};
	}
	if(obj.xml) {
		var model = obj.xml;
		return {
			xml: model.toXML()
		};
	}
}