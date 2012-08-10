exports.redirect_to = function(url) {
	var res = global[this.token].res;
	res.statusCode = 302;
	res.setHeader("Location", url);
	res.end();
}