module.exports = require('edenjs').extend(function() {
	/* Require
	-------------------------------*/
	/* Constants
	-------------------------------*/
	/* Public Properties
	-------------------------------*/
	/* Protected Properties
	-------------------------------*/
	this._paths 	= {};
	this._databases = {};
	
	this._database 	= null;
	this._server	= null;
	
	/* Private Properties
	-------------------------------*/
	/* Magic
	-------------------------------*/
	/* Public Methods
	-------------------------------*/
	/**
	 * Get's a configuration
	 *
	 * @param string
	 * @return this
	 */
	this.config = function(key) {};
	
	/**
	 * Returns a database connection
	 * given the key
	 *
	 * @param string
	 * @return object
	 */
	this.database = function(key) {};
	
	/**
	 * Returns the path given the key
	 *
	 * @param string
	 * @return this
	 */
	this.path = function(key, value) {};
	
	/**
	 * Save any database info in memory
	 *
	 * @return this
	 */
	this.setDatabases = function() {};
	
	/**
	 * Set paths
	 *
	 * @return this
	 */
	this.setPaths = function() {};
	
	/**
	 * Called when a request has started
	 *
	 * @param object request object
	 * @param object response object
	 * @return this
	 */
	this.requestStart = function(request, response) {};
	
	/**
	 * Called when a request has ended
	 *
	 * @param object request object
	 * @param object response object
	 * @return this
	 */
	this.requestEnd = function(request, response) {};
	
	/**
	 * Process to start server
	 *
	 * @return this
	 */
	this.startServer = function() {
		var self = this, settings = this.config('settings').server;
		
		var server = this._server = this.Http()
			.setHost(settings.host)
			.setPort(settings.port)
			//when a request from the client has been made
			.on('request-start', function(request, response) { 
				//ALLOW CORS
				response.headers['Access-Control-Allow-Origin'] = '*';
				
				response.headers['Access-Control-Allow-Headers'] = 
					'origin, x-requested-with, content-type';
				
				response.headers['Access-Control-Allow-Methods'] = 
					'PUT, GET, POST, DELETE, OPTIONS';
				
				//the client is just pinging what's possible
				if(request.method.toLowerCase() == 'options') {
					//send a default response
					response.headers.Allow = 'HEAD,GET,POST,PUT,DELETE,OPTIONS'; 
					response.state = 200;
					
					this.trigger('response', request, response);
					
					return;
				}
				
				self.trigger('server-request-start', request, response);
				self.requestStart(request, response);
			})
			
			//for streaming files
			.on('request-end', function(request, response) {
				//pass it along
				self.trigger('server-request-end', request, response);
				self.requestEnd(request, response);
			})
			
			//for streaming files
			.on('file-start', function(file, mime, key) {
				//pass it along
				self.trigger('server-file-start', file, mime, key);
			})
			
			//for streaming files
			.on('file-data', function(data) {
				//pass it along
				self.trigger('server-file-data', data);
			})
			
			//for streaming files
			.on('file-end', function() {
				//pass it along
				self.trigger('server-file-end');
			})
			
			//when a response has been given out
			.on('output', function(request, response) { 
				//pass it along
				self.trigger('server-output', request, response);
			})
			
			//when there's nothing found
			.on('response-404', function(request, response) {
				//pass it along
				self.trigger('server-response-404', request, response);
			})
			//begin to connect
			.connect();
		
		return this.on('server-response', function(request, response) {
			//pass it along
			server.trigger('response', request, response)
		});
	};
	
	/* Protected Methods
	-------------------------------*/
	/* Private Methods
	-------------------------------*/
}).singleton();