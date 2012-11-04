var util = require('util');
var dbase = require('./dbase');
exports.formTag = function(action,obj) {
	var html = '<form action="' + action + '"';
	var newMethod;
	if(obj) {
		for(var key in obj) {
			if(key == 'method') {
				options[key] = options[key].toUpperCase();
				if(options[key] == 'PUT' || options[key] == 'POST' || options[key] == 'DELETE') {
					newMethod = options[key];
					options[key] = 'POST';
					
				}
				 

			}
			
			html += ' ' + key + '="' + obj[key] + '"';
		}
	}
	html += ' >\n';
	html+= '<input type="hidden" name="_method" value="' + newMethod + '"/>';
	
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
exports.hiddenFieldTag = function(obj) {
	var html = '<input type="hidden" ';
	if(obj) {
		for(var key in obj) {
			html += ' ' + key + '="' + obj[key] + '"';
		}
	}
	html += '></input>';
	return html;
}
exports.searchFieldTag = function(obj) {
	var html = '<input type="search" ';
	if(obj) {
		for(var key in obj) {
			html += ' ' + key + '="' + obj[key] + '"';
		}
	}
	html += '></input>';
	return html;
}
exports.telephoneFieldTag = function(obj) {
	var html = '<input type="tel" ';
	if(obj) {
		for(var key in obj) {
			html += ' ' + key + '="' + obj[key] + '"';
		}
	}
	html += '></input>';
	return html;
}
exports.urlFieldTag = function(obj) {
	var html = '<input type="url" ';
	if(obj) {
		for(var key in obj) {
			html += ' ' + key + '="' + obj[key] + '"';
		}
	}
	html += '></input>';
	return html;
}
exports.emailFieldTag = function(obj) {
	var html = '<input type="email" ';
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

function formBuilderObject(model,mName) {
	var formBuilder = {};
	formBuilder.html = "";
	formBuilder.br = function() {
		this.html += '<br/>';
	}
	formBuilder.label = function(text) {
		this.html += exports.labelTag(text);
		;
	}
	formBuilder.textField = function(oName,obj) {
		obj.name = mName + '[' + oName +']'; 
		obj.id = mName + '_' + oName;
		this.html += exports.textFieldTag(obj);
		;
	}
	formBuilder.passwordField = function(oName,obj) {
		obj.name = mName + '[' + oName +']'; 
		obj.id = mName + '_' + oName;
		this.html += exports.passwordFieldTag(obj);
		;
	}
	formBuilder.hiddenField = function(oName,obj) {
		obj.name = mName + '[' + oName +']'; 
		obj.id = mName + '_' + oName;
		this.html += exports.hiddenFieldTag(obj);
		;
	}
	formBuilder.searchField = function(oName,obj) {
		obj.name = mName + '[' + oName +']'; 
		obj.id = mName + '_' + oName;
		this.html += exports.searchFieldTag(obj);
		;
	}
	formBuilder.telephoneField = function(oName,obj) {
		obj.name = mName + '[' + oName +']'; 
		obj.id = mName + '_' + oName;
		this.html += exports.telephoneFieldTag(obj);
		;
	}
	formBuilder.urlField = function(oName,obj) {
		obj.name = mName + '[' + oName +']'; 
		obj.id = mName + '_' + oName;
		this.html += exports.urlFieldTag(obj);
		;
	}
	formBuilder.emailField = function(oName,obj) {
		obj.name = mName + '[' + oName +']'; 
		obj.id = mName + '_' + oName;
		this.html += exports.emailFieldTag(obj);
		;
	}
	formBuilder.textArea = function(oName,obj) {
		obj.name = mName + '[' + oName +']'; 
		obj.id = mName + '_' + oName;
		this.html += exports.textAreaTag(obj);
		;
	}
	formBuilder.checkbox = function(oName,obj) {
		obj.name = mName + '[' + oName +']'; 
		obj.id = mName + '_' + oName;
		this.html += exports.checkboxTag(obj);
		;
	}
	formBuilder.radioButton = function(oName,obj) {
		obj.name = mName + '[' + oName +']'; 
		obj.id = mName + '_' + oName;
		this.html += exports.radioButtonTag(obj);
		;
	}

	formBuilder.select = function(oName,obj) {
		obj.name = mName + '[' + oName +']'; 
		obj.id = mName + '_' + oName;
		this.html += exports.selectTag(obj);
		;
	}
	formBuilder.submit = function(text) {
		this.html += exports.submit(text);
	}
	return formBuilder;
}
exports.formFor = function(model,mName,options,cb) {
	var html = '';
	html += '<form';
	var newMethod;
	if(options) {
		for(var key in options) {
			if(key == 'method') {
				options[key] = options[key].toUpperCase();
				if(options[key] == 'PUT' || options[key] == 'POST' || options[key] == 'DELETE') {
					newMethod = options[key];
					options[key] = 'POST';
					
				}
				 

			}
			html += ' ' + key + '="' + options[key] + '"';
		}
	}
	html+= '>\n';
	html+= '<input type="hidden" name="_method" value="' + newMethod + '"/>';
	var f = formBuilderObject(model,mName);
	cb(f);
	//console.log(util.inspect(f))
	html += f.html + '\n';
	html += '</form>'
	return html;
}
