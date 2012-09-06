var fs = require('fs'),
	noop = function() {} ;

module.exports = Backbone.Model.extend({
	templates: {},
	defaults: {
		statusCode: 0,
		routes: {
			//'favicon': /favicon\.ico$/i,
			'auth::login': /^\/auth\/login$/,
			'auth::logout': /^\/logout/,
			'auth': /^\/auth\/([a-zA-Z0-9.\-]+)(\/[a-zA-Z0-9.\-]+|)/,
			'static': /\.(gif|jpg|jpeg|tiff|png|ico|css|js|mp3|txt)$/i,
			'feed::read': /^\/feed/,
			'sitemap::read': /^\/sitemap\.xml(\.gz|)/,
			'contact::read': /^\/contact/,
			'post::thumb': /^\/([0-9a-f]+)\/thumb/,
			'post::read': /^\/([a-zA-Z0-9.\-]+)\/([a-zA-Z0-9.\-]+)/,
			'list::home': /^\/$/,
			'list::cat': /^\/([a-zA-Z0-9.\-]+)(\/|)$/,
		}
	},
	initialize: function(options, cb) {
		var self = this;

		// -> Init headers
		this.set('headers', _.extend({}, {
			'Content-Type': 'text/html'
		}, this.get('headers'))) ;

		// -> Init object
		this.getHostname() ;
		this.getSiteName() ;
		this.getSiteAlias() ;
		this.getBaseUrl() ;

		// -> Load site instance from main sites
		this.set('website', this.get('main').sites[this.getSiteAlias()]) ;

		// -> If no config found
		if ( ! self.get('website') ) {
			return self.error('No website configured for : "'+this.getSiteName()+'"...')
		}

		// -> Check request security and close with error if something gets wrong
		this.checkSecurity() ;

		// -> Go on the road if no error
		this.exec() ;

		// -> Logs
		//console.log(this.toJSON())

		// -> Return instance
		return this; 

	},

	/////////////////////////////////////////////////////////////////////// EXEC A REQUEST
	exec: function() {
		var self = this, 
			routes = self.get('routes'),
			match ;

		// -> If response already sent
		if ( self.get('statusCode') ) {
			return tools.error("[!] Request error : response already sent ! "+json({
				statusCode: self.get('statusCode') ,
				path: self.getPath()
			}))
		}

		// -> Parse routes
		for ( var key in routes ) {
			//console.log(key, routes[key], self.getPath().match(routes[key]))
			if ( match = self.getPath().match(routes[key]) ){
				self.set('api', key) ; 
				break;
			}
		}
		
		// -> If something found
		if ( self.get('api') ) {
			var apiMethod = self.api()[self.get('api')] ;
			if ( _.isFunction(apiMethod) ) {
				tools.log(' [>] Server route '+self.getPath()+' :: '+self.get('api')+' => '+match[1]) ;
				apiMethod({	match: match }); 
			}
			else {
				self.error('API method is not defined for "'+self.get('api')+'"...') ;
			}
		}
		else {
			self.error()
		}

	},

	/////////////////////////////////////////////////////////////////////// APIS
	api: function() {
		var self = this; 

		// -> Prepare 
		var now = Date.now() ;
		var options = self.get('main').options; 
		var cacheTimer = Math.floor((now - now%options.cache)/1000);
		var cacheId = self.getSiteAlias()+'::cache::'+(self.getPath().replace(/\//g, '|')) ;
		var layoutId = self.getSiteAlias()+'::cache::layout' ;

		// -> Return api
		var apiMethod = {
			'auth': function(opts) {

				// -> Check provider
				opts = {
					provider: opts.match[1],
					callback: opts.match[2] != '' ? opts.match[2] : null
				}
				
				// -> Check that provider is setted
				if ( self.get('website').get('providers')[opts.provider] ) {

					// -> Bind first redirect
					var routerParams = opts.callback ? { successRedirect: '/', failureRedirect: '/#login' } : self.get('website').get('providers')[opts.provider].opts  ;
					var router = options.passport.authenticate(opts.provider+'::'+self.getSiteAlias(), routerParams ) ;

					// -> Exec route
					router(self.get('req'), self.get('res'), self.get('next'));
				}

				// -> Else no provider setted
				else {
					self.error('No auth mechanism for :: '+opts.provider+' !') ;
				}

				//passport.authenticate('facebook', {scope: 'email' })

				//tools.log(self.getPath()+('::')+json(opts))
				//self.get('next')() ;
			},
			'auth::login': function(opts) {

				// -> Map provider name
				var providers = _.map(
					self.get('website').get('providers'), 
					function(val, key) {
						return _.extend({name: key}, val);
					}
				) ;

				// -> Set first as active
				_.first(providers).active = true ;

				// -> Display
				self.sendWithLayout({
					page: {
						name: self.get('website').get('title')+' > '+"Login",
						content: VaSH.Mustache.to_html(self.get('website').templates['login.html']||'', {
							providers: providers
						}),
						full: true
					}
				})

			},
			'auth::logout': function() {
				self.get('req').logout();
				setTimeout(function() {
					self.get('res').redirect('/');
				}, 500); 
			},
			'favicon': function() {
				self.get('next')() ;
			},
			'static': function() {
				if ( /^\/common/.test(self.getPath()) ) self.set('sitealias', 'common') ;
				var fileServer = self.get('main').fileServer[self.get('sitealias')] ;
				if ( fileServer ) {
					fileServer.serve(self.get('req'), self.get('res'), function(err) {
						if ( err ) self.error('[!] API Static error : '+self.getPath()+' :: '+err.message)
					});
				} else {
					self.error('File server is not defined !') ;
				}
			},
			'feed::read': function() {
				return self.get('website').feed(function(err, feed) {
					if ( err ) self.error('Feed error...') ;
					else self.sendXML(feed) ;
				})
			},
			'sitemap::read': function(opts) {
				return self.get('website').sitemap(function(err, feed) {
					if ( err ) self.error('Feed error...') ;
					else if ( opts[2]=='.gz' ) self.sendGzip(feed) ;
					else self.sendXML(feed) ;
				})
			},
			'list::cat': function(opts) {

				// -> If cat is in match result
				if ( opts && opts.match ) {
					opts.cat = opts.match[1] ;
					delete opts.match;
				}

				// -> Define filters to apply
				var filters = _.extend({
					page: self.get('req').query.page||1,
					cat: null,
					by: 'created',
					desc: true
				}, opts) ;

				// -> Some logs
				tools.warning('List::cat::'+json(filters))

				// -> Request post list html
				self.get('website').list(filters, function(err, doc) {
					if ( err || ! doc || ! doc.page ) self.error() ;
					else self.sendWithLayout(doc)
				}) 

			},
			'list::home': function() {
				apiMethod['list::cat']() ;
			},
			'post::read': function(opts) {
				apiMethod['list::cat']({
					cat: opts.match[1],
					permalink: opts.match[2] 
				}) ;
			},
			'post::thumb': function(opts) {
				var fileServer = self.get('main').fileServer[self.get('sitealias')+'_posts'] ;
				if ( fileServer ) {
					//self.get('req').url = '/37610026647c57ca3d59c66d15aa3dc3_thumb.jpg';

					// -> Test if jpg exists
					var pic_path ;
					async.series([
						function(callback) {
							pic_path = fileServer.root + '/' + opts.match[1] + '_thumb.jpg' ;
							fs.exists( pic_path , function(exists) {
								console.log(pic_path, exists)
								callback(exists?pic_path:null) ;
							})
						},
						function(callback) {
							pic_path = fileServer.root + '/' + opts.match[1] + '_thumb.png' ;
							fs.exists( pic_path , function(exists) {
								console.log(pic_path, exists)
								callback(exists?pic_path:null) ;
							})
						}
					], function(err, res) {
						if ( err ) self.get('req').url = err.replace(new RegExp(fileServer.root), '') ;
						fileServer.serve(self.get('req'), self.get('res'), function(err) {
							if ( err ) self.error('[!] API Static error : '+self.getPath()+' :: '+err.message)
						});
					})

				} else {
					self.error('File server is not defined !') ;
				}
			}
		}

		// -> Return methods
		return apiMethod;
	},

	/////////////////////////////////////////////////////////////////////// SEND CONTENT
	// -> Send content without wrap it
	sendWithLayout: function(datas) {
		var self = this; 

		// -> Set status code
		self.set('statusCode', datas.statusCode || 200) ;

		// -> Merge datas
		//console.log(self.get('req').user)
		datas.userid = (self.get('req').user||{}).provider+'_'+(self.get('req').user||{}).id; 
		var view = tools.extend({}, {
			user: self.get('req').user
		}, {
			site: self.get('website').toJSON()
		}, datas) ;
/*
		console.log("--------------------------------------------------------")
		console.log(_.clone(self.get('website').toJSON()))
		console.log(_.clone(datas))
		console.log(_.clone(view))
		console.log("--------------------------------------------------------")
*/
		// -> Build Etag
		var now = Date.now() ;
		var options = self.get('main').options; 
		var cacheTimer = Math.floor((now - now%options.cache)/1000);
		var pageId = self.getSiteAlias()+'::'+JSON.stringify(view)+'::'+cacheTimer ;
		var etag = tools.md5(pageId)
		var req = self.get('req') ;
		var res = self.get('res') ;

		// -> Set headers
		var headers = {
				'Content-Type': 'text/html',
				'ETag': etag
			} ; 

		// -> Set debug output
		var outDebug = {
			userid: view.userid,
			pageId: etag,
			url: self.getBaseUrl()+self.get('req').url
		} ;

		// -> Check if etag changed
		if(req.headers['if-none-match'] === headers.ETag && self.set('statusCode') == 200 && ! options.debug ) {
			res.statusCode = 304;
			res.end();
			tools.debug('[>] Return 304 : '+JSON.stringify(outDebug)) ;
			return;
		}
		else {
			tools.warning('[>] Generate HTML : '+JSON.stringify(outDebug)) ;
		}

		// -> Build output
		var html = VaSH.Mustache.to_html(self.get('website').templates['index.html'], view) ;

		// -> Add extra informations to headers
		headers['Content-Length'] = html.length ;

		// -> If user is not logged, set cache control on page, else only ETag cache check
		//headers['Cache-Control'] = 'max-age=' + (options.cache / 1000) ;
			
		// -> Write headers
		res.writeHead(self.get('statusCode')||200, headers) ;

		// -> Return response
        res.end(html); 
	},

	/////////////////////////////////////////////////////////////////////// SEND XML
	// -> Assume no cache in headers
	sendXML: function(content) {
		var self = this; 
		self.get('headers')['Content-Type'] = 'text/xml';
		self.set('statusCode', 200) ;
		self.get('res').writeHead(self.get('statusCode'), self.get('headers'))
		self.get('res').end(content) ;
	},

	/////////////////////////////////////////////////////////////////////// SEND GZIP
	// -> Assume no cache in headers
	sendGzip: function(content) {
		var self = this; 

	    // Set the appropriate HTTP headers to help old and new browsers equally to how to handle the output
	    self.get('res').header('Content-Type: application/x-gzip');
	    self.get('res').header('Content-Encoding: gzip');
	    self.get('res').header('Content-Disposition: attachment; filename="sitemap.xml.gz"');
	    zlib.gzip(new Buffer(content, 'utf8'), function(error, data) {
	        self.get('res').end(data);
	    });

	},	

	/////////////////////////////////////////////////////////////////////// RESPONDS ERROR
	// -> Return error page
	error: function(page) {
		var self = this ;

		// -> If response already sent
		if ( self.get('statusCode') ) {
			return tools.error("[!] Request error : response already sent ! "+json({
				statusCode: self.get('statusCode') ,
				path: self.get('req').path
			}))
		}

		// -> Parse and protect param
		page = page || {} ;
		if ( typeof page == 'string' ) page = {content: page} ;

		// -> No Config found for website ?
		if ( ! self.get('website') ) {
			return self.get('res').end(page.content)
		}

		// -> Defaults for page
		page = _.extend({}, {
			statusCode: 404, 
			content: "Something gets wrong...", 
			path: self.getPath(),
			name: self.get('website').get('title')+ ' > Houston ? ',
			desc: 'Yeah... I think you have a problem...'
		}, page);

		// -> Log error
		tools.error('[!] Error in page :: '+json(page));

		// -> Display through layout
		self.sendWithLayout({
			statusCode: page.statusCode,
			page: page
		})

	},

	/////////////////////////////////////////////////////////////////////// HELPERS
	// -> Check Security
	checkSecurity: function() {
		if ( this.get('hostname') && this.get('hostname') != this.get('sitename') ) {
			this.error("Not like that...\n[G33K]") ;
			return false;
		}
		else if ( ! this.get('website') ) {
			this.error("WebSite instance doesn't exists...\n[G33K]") ;
			return false;
		}
		return true;
	},

	// -> Return full bse url
	getBaseUrl: function() {
		return ( this.get('req').connection.encrypted ? 'https' : 'http' ) + '://'+this.get('req').headers.host ;
	},

	// -> Return url path
	getPath: function() {
		return this.get('req').path;
	},

	// -> Return request hostname
	getHostname: function() {
		if ( this.get('hostname') ) return this.get('hostname');
		try { this.set('hostname', (this.get('req').headers.host||'').split(':')[0]); } catch(e) {}
		return this.get('hostname');
	},

	// -> Get related sitename
	getSiteName: function() {
		if ( this.get('sitename') ) return this.get('sitename');
		try { this.set('sitename', this.get('hostname').replace(/[^a-zA-Z_0-9.]+/g, '-'))  } catch(e) {}
		return this.get('sitename');
	},

	// -> Get site alias
	getSiteAlias: function() {
		var self = this ;
		if ( this.get('sitealias') ) return this.get('sitealias');

		// -> Try to find alias in site config
		var founded = _.find(this.get('main').sites, function(site, sitename) {
			if ( site.get('aliases') && site.get('aliases').indexOf(self.get('sitename')) > -1 ) {
				site.alias = sitename ;
				return true ;
			}
		}) ;

		// -> No alias ? return sitename
		this.set('sitealias', founded ? founded.alias : this.get('sitename')) ;
		//tools.warning(this.get('sitealias')) ;

		// -> Returns alias
		return this.get('sitealias'); 

	},

	// -> Export datas
	toJSON: function() {
		var exclude_keys = ['main', 'req', 'res', 'next', 'website', 'routes', 'passport'] ;
		var out = {} ;
		_.each(this.attributes, function(item, key) {
			if ( exclude_keys.indexOf(key) < 0 ) out[key] = item ;
		})
		return out
	}
}) 