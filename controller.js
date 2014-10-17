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
	this.config = function(key) {
		return require(this._paths.config + '/' + key);
	};
	
	/**
	 * Returns a database connection
	 * given the key
	 *
	 * @param string
	 * @return object
	 */
	this.database = function(key) {
		//if there is no database
		if(typeof this._databases[key] === 'undefined') {
			return this._database;
		}
		
		return this._databases[key];
	};
	
	/**
	 * Returns the path given the key
	 *
	 * @param string
	 * @return this
	 */
	this.path = function(key, value) {
		if(value) {
			this._paths[key] = value;
			return this;
		}
		
		return this._paths[key];
	};
	
	/**
	 * Save any database info in memory
	 *
	 * @return this
	 */
	this.setDatabases = function() {
		var databases = this.config('database'), database;
		
		for(var key in databases) {
			if(databases.hasOwnProperty(key)) {
				database = databases[key];
				
				switch(database.type) {
					case 'mongo':
						this._databases[key] = this.Mongo(
							database.host, 
							database.port, 
							database.name);
						
						break;
					case 'mysql':
						this._databases[key] = this.Mysql(
							database.host, 
							database.port, 
							database.name,
							database.user,
							database.pass);
						
						break;
					case 'postgres':
						this._databases[key] = this.Postgres(
							database.host, 
							database.port, 
							database.name,
							database.user,
							database.pass);
						
						break;
					case 'sqlite':
						this._databases[key] = this.Postgres(database.file);
						
						break;
				}
				
				if(database.default) {
					this._database = this._databases[key];
				}
			}
		}
		
		return this;
	};
	
	/**
	 * Set paths
	 *
	 * @return this
	 */
	this.setPaths = function() {
		this.path('root'		, __dirname)
			.path('config'		, __dirname + '/config')
			.path('action'		, __dirname + '/action')
			.path('template'	, __dirname + '/template')
			.path('event'		, __dirname + '/event')
			.path('upload'		, __dirname + '/upload');
		
		return this;
	};
	
	/**
	 * Called when a request has started
	 *
	 * @param object request object
	 * @param object response object
	 * @return this
	 */
	this.requestStart = function(request, response) {
		response.processing = true;
		
		var path 		= request.path;
		var pathArray 	= request.pathArray;
		var variables 	= [];
		var page 		= 'index';
		
		//
		
		return this;
	};
	
	/**
	 * Called when a request has ended
	 *
	 * @param object request object
	 * @param object response object
	 * @return this
	 */
	this.requestEnd = function(request, response) {
		
		
		return this;
	};
	
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