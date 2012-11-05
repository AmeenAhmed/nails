// @Author : Ameen Ahmed
// cookies.js :
// This file contains the code to set and retrieve cookies. For the storage and retrieval of the cookies
// the cookies module is used which uses keygrip for signing the cookies

var Cookies = require('cookies');
var keygrip = require('keygrip')();
var util = require('util');
			
// function	: 	createSession
// args		: 	req => request object
//				res => response object
// returns	: 	nothing
// desc		: 	creates a session id and stores a session and a cookies hash if session id is not found

exports.createSession = function(req,res) {
	cookies = new Cookies(req,res,keygrip);
	var sid = Date.now().toString();
	if(!cookies.get('session_id', {signed:true})) {
		cookies.set('session_id',sid,{signed:true});
		cookies.set('session','{}',{signed:true});
		cookies.set('cookies','{}',{signed:true});
	}
}

// function	: 	getSessionHash
// args		: 	req => request object
//				res => response object
//				hashKey => the key which is to be retrieved from the cookies
// returns 	: 	the value found in the cookie for the key
// desc		: 	takes a key gives back the value for the key in the cookies

exports.getSessionHash = function(req,res,hashKey) {
	cookies = new Cookies(req,res,keygrip);
	var cStr = cookies.get(hashKey,{signed:true});
	var session = '{}';
	if(cStr) {
		session = JSON.parse(cStr);
	}
		
	return session;
}

// function	: 	setSessionHash
// args		: 	req => request object
//				res => response object
//				hashKey => the key which is to be retrieved from the cookies
//				hash	=> the value to be stored in the cookies for the hashKey
// returns	: 	nothing
// desc		: 	sets a session hash value for the given hashKey in the cookies
exports.setSessionHash = function(req,res,hashKey,hash) {
	cookies = new Cookies(req,res,keygrip);
	var sessionJSON = JSON.stringify(hash);
	cookies.set(hashKey,sessionJSON,{signed:true});
}
