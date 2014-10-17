module.exports = require('edenjs').extend(function() {
	/* Require
	-------------------------------*/
	var template = require('handlebars');
	
	/* Constants
	-------------------------------*/
	/* Public Properties
	-------------------------------*/
	/* Protected Properties
	-------------------------------*/
	this._controller = null;
	this._template = '/index.html';
	
	/* Private Properties
	-------------------------------*/
	/* Magic
	-------------------------------*/
	this.___construct = function(controller) {
		this._controller = controller;
	};
	
	/* Public Methods
	-------------------------------*/
	this.end = function(request, response) {
		this.sync(function(next) {
			var path = this._controller.path('template') + this._template;
			
			this.File(path).getContent(next);
		})
		
		.then(function(error, content, next) {
			this._controller
				.database()
				.search('sample')
				.getRows(next.bind(null, content.toString()))
		})
		
		.then(function(content, error, rows) {
			rows = rows || [];
			response.message = template.compile(content)({
				rows: rows,
				foo: 'bar' });
			
			this._controller.trigger('server-response', request, response);	
		});
	};
	
	/* Protected Methods
	-------------------------------*/
	/* Private Methods
	-------------------------------*/
}).singleton();