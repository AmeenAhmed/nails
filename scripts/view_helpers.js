
exports.formTag = function(action,obj) {
	var html = '<form action="' + action + '"';
	if(obj) {
		for(var key in obj) {
			html += ' ' + key + '="' + obj[key] + '"';
		}
	}
	html += ' >';
	return html;
}

exports.formEnd = function() {
	return '</form>';
}

exports.labelTag = function(text) {
	return '<label>' + text + '</label>';
}

exports.textFieldTag = function(obj) {
	var html = '<input type="text" ';
	if(obj) {
		for(var key in obj) {
			html += ' ' + key + '="' + obj[key] + '"';
		}
	}
	html += '></input>';
	return html;
}

exports.passwordFieldTag = function(obj) {
	var html = '<input type="password" ';
	if(obj) {
		for(var key in obj) {
			html += ' ' + key + '="' + obj[key] + '"';
		}
	}
	html += '></input>';
	return html;
}

exports.textAreaTag = function(obj) {
	var html = '<textarea ';
	if(obj) {
		for(var key in obj) {
			if(key == 'size') {
				var els = obj['size'].split('x');
				html += ' cols="' + els[0] + '" rows="' + els[1] + '"';
				continue;
			}
			html += ' ' + key + '="' + obj[key] + '"';
		}
	}
	html += '></textarea>';
	return html;
}

exports.checkboxTag = function(obj) {
	var html = '<input type="checkbox"';
	if(obj) {
		for(var key in obj) {
			html += ' ' + key + '="' + obj[key] + '"';
		}
	}
	html += '></input>';
	return html;
}

exports.radioButtonTag = function(obj) {
	var html = '<input type="radio"';
	if(obj) {
		for(var key in obj) {
			html += ' ' + key + '="' + obj[key] + '"';
		}
	}
	html += '></input>';
	return html;
}

exports.selectTag = function(obj) {
	var html = '<select ';
	if(obj) {
		for(var key in obj) {
			if(key == 'choices') {
				continue;
			}
			html += ' ' + key + '="' + obj[key] + '"';
		}
	}
	html += '>';
	if(obj.choices) {
		for(var i=0; i< obj.choices.length; i++) {
			html += '<option ';
			if(obj.choices[i].value) {
				html += 'value="' + obj.choices[i].value +'"'; 
			}
			html += '>' + obj.choices[i].text + '</option>';
			
		}
	}
	html += '</select>';
	return html;
}

exports.submit = function(text) {
	return '<input type="submit" value="'+text+'"></submit>';
}
