//@ Author : Ameen Ahmed
// Log.js : 
// Log helper with info, debug, error messages.

function printLogTime() {
	var date = new Date();
	var month = prefixZero(date.getMonth());
	var dateNum = prefixZero(date.getDate());
	var hours = prefixZero(date.getHours());
	var minutes = prefixZero(date.getMinutes());
	var seconds = prefixZero(date.getSeconds());

	return "["+ date.getFullYear()+"-"+month+"-"+dateNum+" "+
				hours+":"+minutes+":"+seconds + "] "
				+ "INFO  ";
}

function prefixZero(num) {
	if(num < 10) {
		return "0" + num;
	}
	return num;
}

exports.info = function(message) {
	console.log(printLogTime() + message);
}