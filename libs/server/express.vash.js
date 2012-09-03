// -- Load libs
var fs = require('fs'),
	cluster = require('cluster'),
	_url = require('url'),
	watch = require('watch'),
    numCPUs = require('os').cpus().length,
    static = require('node-static'),
    zlib = require('zlib') ;

// -- VaSH Class
var VaSH = function(options) {
	this.fileServer = {} ;
	this.options = _.extend({
		sites_path: 'sites/',
		skins_path: 'skins/',
		skin: 'default',
		alias: {
			'default': ['localhost', '127.0.0.1']
		},
		static_cache: 5*60*1000,
		static_extension: ['js', 'css', 'mp3', 'png', 'jpg', 'ico']
	}, options) ;
	this.load() ;
	this.monitor_debug() ;
	return this; 
} ;

// -- Define objects
VaSH.Site = require('./express.vash.site') ;

VaSH.Mustache = require('mustache');

// -- Define models
VaSH.Models = {
	post: require('./models/model.post').shared
}

// -- Load blogs config
VaSH.prototype.load = function() {
	var self = this ;

	// -> Set as not ready
	self.ready = false; 
	self.config = {} ;
	self.sites = {} ;
	//self.posts = {} ;

	// -> Clear cache
	self.clearCache() ;

	// -> Parse 'sites' directory to find config.js files
	async.waterfall([

		// -> Create common static server
		function(callback) {
			self.fileServer['common'] = new(static.Server)('libs', {cache: self.options.static_cache});
			callback(null)
		},

		// -> Parse dir to find config.js files 
		function(callback) {
			tools.log('[>] Load configs from : '+self.options.sites_path)
			fs.readdir(self.options.sites_path, function(err, datas) {
				callback(err, datas) ;
			}) ;
		},

		// -> Get config file and load it
		function(sites, callback) {
			async.forEachSeries(sites, function(site, callback) {

				var opts = _.extend({
					public_path: self.options.sites_path+site,
					file: self.options.sites_path+site+'/config.js'
				}, self.options) ;

				fs.exists(opts.file, function(exists) {
					if ( ! exists ) return callback() ;
					tools.warning('[>] Config found : '+opts.file); 

					// -> Create static server
					self.fileServer[site] = new(static.Server)(self.options.sites_path+site+'/public', {cache: self.options.static_cache});

					// -> Register site
					self.sites[site] = new VaSH.Site(opts, function(cb) {
						callback() ;
					}) ;

				})
			}, function(err, res) {
				callback(err) 
			}) ;		
		},

		// -> Set policies
		function(callback) {
			callback() ;
		}

	], function(err, success) {
		//console.log(self.sites)
		self.ready = true ;
	}) ;

}

// -- Clear cache
VaSH.prototype.clearCache = function() {
	this.cache = {} ;
}

// -- Is hacked
VaSH.prototype.isHacked = function(res) {
	res.send(500, "Not like that...\n[G33K]") ;
}

// -- Send error
VaSH.prototype.error = function(res, msg) {
	res.send(404, msg||"Something gets wrong...") ;
}

// -- Serve static file
VaSH.prototype.serveStatic = function(site, req, res) {
	if ( this.fileServer[site] ) this.fileServer[site].serve(req, res);
	else this.error(res, msg) ;
}

// -- Manage a request
VaSH.prototype.get = function(req, res, next) {

	// -> Define which website to load
	var self = this,
		options = self.options,
		hostname, site, public_path, req_path, fileExt ;

	// -> Get site from hostname
	//console.log(_url.parse(req.url))
	hostname = ((req.headers.host||'').split(':')[0]);
	//hostname = _url.parse(req.url).hostname ;
	
	// -> Protect site name for public path
	site = hostname.replace(/[^a-zA-Z_0-9.]+/g, '-'); 

	// -> Render error if hostname hacking
	if ( site != hostname ) return self.isHacked(res) ;

	// -> If hostname is localhost => reroute to default
	if ( _.isArray(options.alias.default) && options.alias.default.indexOf(site) >= 0 ) 
		site = 'default' ;

	// -> Set public path and request path
	public_path = root_path+'/'+options.sites_path + site + '/public' ;
	req_path = req.path ;

	// -> For index.html
	if ( req_path == '/' ) req_path = '/index.html' ;

	// -> Logs
	//console.log(req.url, req_path, public_path)

	// -> Serve static files other than html
	fileExt = tools.extension(req_path) ;
	if ( options.static_extension.indexOf(fileExt) >= 0 ) {
		if ( /^\/common/.test(req_path) ) site = 'common'; 
		return self.serveStatic(site, req, res) ;
	}

	// -- Serve dynamic content in other cases

	// -> Define template path
	var layoutPath = public_path+'/index.html' ;

	// -> Set vars
	var now = Date.now() ;
	var cacheTimer = Math.floor((now - now%options.static_cache)/1000);
	var cacheId = site+'::cache::'+(req_path.replace(/\//g, '|')) ;
	var layoutId = site+'::cache::layout' ;
	var siteObj = self.sites[site] ;

	// -> Operations in parallel to prepare building
	async.parallel({

		// -> Get layout
		layout: function(callback) {
			if ( self.cache[layoutId] && self.cache[layoutId].timer == cacheTimer ) {
				callback(null, self.cache[layoutId]) ;
			} else {
				fs.exists(layoutPath, function(exists) {
					if (!exists) return callback('File not exists')
					fs.readFile(layoutPath, 'utf8', function(err, datas) {
						self.cache[layoutId] = {
							timer: cacheTimer,
							content: datas
						}; 
						callback(err, self.cache[layoutId]) ;
					})
				})
			}
		},

		// -> Get templates datas
		datas: function(callback) {

			// -> Set filters
			var filters = {
				page: 1,
				cat: null,
				by: 'created',
				desc: true
			}

			// -> Get template to load
			var permalink = req.path.match(/^\/([a-zA-Z0-9.\-]+)\/(.*)/) ;
			if ( permalink && permalink[2] ) {
				filters.permalink = permalink[2] ;
			}

			// -> Get content
			siteObj.list(filters, function(err, page) {
				callback(err, page)
			}) 

		},

		// Ass layoutId to response
		layoutId: function(callback) {
			callback(null, layoutId) ;
		}

	}, 

	// -> Merge datas with layout
	function(err, success) {

		// -> Merge datas
		var view = _.deepExtend({}, self.sites[site].toJSON(), success.datas) ;

		// -> Build Etag
		var pageId = site+'::'+JSON.stringify(success.datas)+'::'+cacheTimer ;
		var etag = tools.md5(pageId)

		// -> Set headers
		var statusCode = 200,
			headers = {
				'Content-Type': 'text/html',
				'ETag': "'"+etag+"'"
			} ; 

		// -> Check if etag changed
		if(req.headers['if-none-match'] === headers.ETag) {
			res.statusCode = 304;
			res.end();
			tools.debug('[>] Return 304 : '+JSON.stringify(view)) ;
			return;
		}
		else {
			tools.warning('[>] Generate HTML : '+JSON.stringify(view)) ;
		}

		// -> Build output
		var html = VaSH.Mustache.to_html(success.layout.content, view) ;

		// -> Add extra informations to headers
		_.extend(headers, {
			'Content-Length': html.length,
			'Cache-Control': 'public, max-age=' + (self.options.static_cache / 1000)
		})

		// -> Write headers
		res.writeHead(statusCode, headers) ;

		// -> Return response
        res.end(html); 

		// --> 
		//self.serveTemplate(success, req, res) ;
	}); 

} ;

// -- Serve a template file
VaSH.prototype.serveTemplate = function(layout, req, res) {
	var self = this ;
		
	var acceptEncoding = req.headers['accept-encoding'] || '' ;
	var compression = null;

	if (acceptEncoding.match(/\bgzip\b/)) compression = 'gzip' ;
	else if (acceptEncoding.match(/\bdeflate\b/)) compression = 'deflate';

	self.getTemplateCompressed(compression, layout, function(err, datas) {
		if ( err ) {
			self.error(res, err)
		} else {

			// Prepare headers
			var headers = {
				'Content-Type': 'text/html',
				'Content-Length': datas.length,
				'ETag': "'"+tools.md5(datas)+"'",
				'Cache-Control': 'public, max-age=' + (self.options.static_cache / 1000)
			} ;

			// Add compression headers
			if ( compression ) headers['content-encoding'] = compression ;

			// If no change, return 304 code
			console.log(req.headers)
			if(req.headers['if-none-match'] === headers.ETag) {
				res.statusCode = 304;
  				res.end();
			}

			// Else return datas with a 200 statusCode
			else {
				res.writeHead(200, headers);            			
				res.end(datas)	
			}

		}
	}) ;

}

// -- Serve compressed template
VaSH.prototype.getTemplateCompressed = function(compression, layout, callback) {
	var self = this;

	// Get builded template
	console.log(layout.layoutId, compression) ;

	// Cache compressed file
	if ( compression ) {
		if ( self.cache[layout.layoutId]['content_'+compression] ) {
			callback(null, self.cache[layout.layoutId]['content_'+compression])
		} else {
			var input = new Buffer(self.cache[layout.layoutId].content, 'utf8') ;
			zlib[compression](input, function(err, buffer) {
				if (!err) {
					self.cache[layout.layoutId]['content_'+compression] = buffer ;
					callback(null, buffer) ;
				}
				else {
					callback('Gzip compression error !') ;
				}
			})
		}
	}

	// Non compressed file
	else {
		callback(null, self.cache[layout.layoutId].content); 
	}

}


// -- Restart on server code change
VaSH.prototype.monitor_debug = function() {
    watch.createMonitor(root_path+'/', function (monitor) {
        monitor.on("created", function (f, stat) {
            tools.warning(' [*] '+(cluster.isMaster?'M':cluster.worker.id)+' | Code changed !');
            cluster.worker.destroy() ; 
        })
        monitor.on("changed", function (f, curr, prev) {
            tools.warning(' [*] '+(cluster.isMaster?'M':cluster.worker.id)+' | Code changed !');
            cluster.worker.destroy() ;  
        })
        monitor.on("removed", function (f, stat) {
            tools.warning(' [*] '+(cluster.isMaster?'M':cluster.worker.id)+' | Code changed !');
            cluster.worker.destroy() ; 
        })
    }) ;
}

// Init VaSH instance
GLOBAL.VaSH = VaSH; 
var vash = new VaSH() ;

// Export class
module.exports = function(options) {
    return function(req, res, next) {
    	vash.get(req, res, next); 
    }
}
