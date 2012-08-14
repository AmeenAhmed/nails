exports.templateMissing = function(url) {
	return '<h1>Template is Missing</h1>' +
			'<p>Missing template '+url+', Searched in : '+process.cwd()+'/app/views</p>';
}
exports.unknownAction = function(action,controller) {
	return '<h1>Unknown Action</h1>' +
			'<p>The action \''+action+'\' could not be found for '+controller+'_controller</p>';
}
exports.noController = function(controller) {
	return '<h1>Routing Error</h1>' + 
			'<p>The controller ' + controller + ' could not be found'
}
exports.noRouteMatch = function(method,url) {
	return '<h1>Routing Error</h1>' + 
				'<p>No route macthes ['+method.toUpperCase()+'] "'+url+'"</p>';
}