var Cookies = require('cookies');
var keygrip = require('keygrip')();
var util = require('util');
			
exports.createSession = function(req,res) {
	cookies = new Cookies(req,res,keygrip);
	var sid = Date.now().toString();
	if(!cookies.get('session_id', {signed:true})) {
		cookies.set('session_id',sid,{signed:true});
		cookies.set('session','{}',{signed:true});
		cookies.set('cookies','{}',{signed:true});
	}
}

exports.getSessionHash = function(req,res,hashKey) {
	cookies = new Cookies(req,res,keygrip);
	var cStr = cookies.get(hashKey,{signed:true});
	//console.log(cStr);
	var session = '{}';
	if(cStr) {
		session = JSON.parse(cStr);
	}
		
	//console.log('Session : '  +util.inspect(session));
	return session;
}

exports.setSessionHash = function(req,res,hashKey,hash) {
	cookies = new Cookies(req,res,keygrip);
	var sessionJSON = JSON.stringify(hash);
	cookies.set(hashKey,sessionJSON,{signed:true});
}
