// @Author : Ameen Ahmed
// helpers.js :
// This file contains thh redirectTo and render methods which are used in the controller code

 

var util = require('util');


// function	: 	redirectTo
// args		: 	the url to redirect to
// returns	: 	the object which is caught by the dispatcher to understand that a redirect has been issued
// desc		: 	when called from the controller this object returns back an object which identifies the
//				request to redirect to the dispatcher

exports.redirectTo = function(url) {
	return { status: 302, response:url };
}

// function	: 	render
// args		: 	an obj with json | xml as true { json:<model instance> } 	
// returns	: 	an object with the model converted to json or xml
// desc		: 	called within the controller returns a model converted to json or xml the dispatcher catches
//				it and returns the json or xml file back to the client
	
exports.render = function(obj) {
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