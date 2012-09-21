// -- Load libs
var fs = require('fs'),
	cluster = require('cluster'),
	watch = require('watch'),
    static = require('node-static') ;

// -- Shared instance
var vash ;

// -- VaSH Class
var VaSH = function(options) {
	
	// -> Set options
	this.options = tools.extend({
		sites_path: 'sites/',
		skins_path: 'skins/',
		passports_path: 'passports/',
		skin: 'default',
		debug: false,
		cache: 5*60*1000
	}, options) ;

	// -> Load Framework
	this.load() ;

	// -> Restart cluster on code changes
	this.monitor_debug() ;

	// -> Return instance
	return this; 

} ;

// -- Define objects
VaSH.Site = require('./express.vash.site') ;
VaSH.Request = require('./express.vash.request') ;

// -- Helpers
VaSH.Mustache = require('mustache');
VaSH.Packer = require('./express.vash.packer') ;

// -- Define models
VaSH.Models = {
	post: require('./models/model.post').shared
}

// -- Define Controllers
VaSH.Controllers = {
	admin: require('./controllers/controller.admin').shared
}

// -- Load blogs config
VaSH.prototype.load = function() {
	var self = this ;

	// -> Set as not ready
	self.ready = false; 
	self.fileServer = {} ;
	self.sites = {} ;
	self.strategies = {} ;

	// -> Clear cache
	self.clearCache() ;

	// -> Parse 'sites' directory to find config.js files
	async.waterfall([

		// -> Create common static server
		function(callback) {
			self.fileServer['common'] = new(static.Server)('libs', {cache: self.options.cache});
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
					configFile: self.options.sites_path+site+'/config.js',
					name: site
				}, self.options) ;

				fs.exists(opts.configFile, function(exists) {
					if ( ! exists ) return callback() ;
					tools.warning('[>] Config found : '+opts.configFile); 

					// -> Create static server
					self.fileServer[site] = new(static.Server)(self.options.sites_path+site+'/public', {cache: self.options.cache});
					self.fileServer[site+'_posts'] = new(static.Server)(self.options.sites_path+site+'/posts', {cache: self.options.cache});

					// -> Register site
					self.sites[site] = new VaSH.Site(opts, function(cb) {
						callback() ;
					}) ;
				})

			}, function(err, res) {
				callback(err) 
			}) ;		
		},

		// -> Load passports strategies from directory
		function(callback) {

			fs.readdir(__dirname+'/'+self.options.passports_path, function(err, datas) {

				// -> No passports ? OK skip...
				if ( err ) return callback() ;

				// -> Load each strategies
				async.forEachSeries(datas, function(name, callback) {
					if ( /^passport-/.test(name) ) {
						self.strategies[name] = require(__dirname+'/'+self.options.passports_path+name).Strategy
					}
					callback() ;
				}, function(err, datas) {
					callback() ;
				}) 

			}) ;

		},
		
		// -> Load passports strategies for each website
		function(callback) {

			// -> If no strategies... pass
			if ( ! _.keys(self.strategies).length ) {
				tools.error('[!] No passport strategies defined ! You could not login without !')
				return callback() ;
			}

			// -> Create passport routes
			async.forEachSeries(_.keys(self.sites), function(site, callback) {

				var siteConfig = self.sites[site] ;
				var providers = siteConfig.get('providers') ;

				_.each(providers, function(datas, provider) {

					tools.warning('[>] Register passport module => '+provider+'::'+site)
					var strategy = self.strategies['passport-'+provider] ;
					var _strategy = new strategy(_.extend({
							name: provider+'::'+site,
							callbackURL: siteConfig.getBaseUrl()+"/auth/"+provider+"/callback",
							returnURL: siteConfig.getBaseUrl()+"/auth/"+provider+"/callback",
							profile: true,
							audience: siteConfig.getBaseUrl()
						}, datas.infos),
						function(accessToken, refreshToken, profile, done) {
							process.nextTick(function () {
				                return done(null, profile);
				            });
						}
					) ;
					self.options.passport.use(_strategy)

				}) ;

				callback(); 

			}, function(err, res) {
				callback(); 
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

// -- Bind request
VaSH.prototype.request = function(req, res, next) {
	req.id = Math.floor(Math.random()*10000000000) ;
	return new VaSH.Request({
		main: this,
		req: req,
		res: res,
		next: next
	})
}

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
				'Cache-Control': 'public, max-age=' + (self.options.cache / 1000)
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

	var shouldReload = function(f) {
		tools.warning(' [*] '+(cluster.isMaster?'M':cluster.worker.id)+' | Code changed on '+f+' !');
		if ( /posts\//.test(f) ) return false;
		else if ( /\.git\//.test(f) ) return false;
		else if ( /templates\//.test(f) ) return false;
		else if ( /libs\/common\//.test(f) ) return false;
		else if ( /public\//.test(f) ) return false;

		// -> Server will reload
		tools.log(' [*] '+(cluster.isMaster?'M':cluster.worker.id)+' | Kill instance after code changed !', 'purple');
		setTimeout(function(){cluster.worker.destroy()}, 1000); 
		return true;
	}

    watch.createMonitor(root_path+'/', function (monitor) {
        monitor.on("created", function (f, stat) {
            tools.warning(' [*] '+(cluster.isMaster?'M':cluster.worker.id)+' | Code added !');
           	shouldReload(f); 
        })
        monitor.on("changed", function (f, curr, prev) {
            if ( ! /\.min\.css/.test(f) && ! /\.min\.js/.test(f) && ! /\/logs/.test(f) ) {
            	//tools.warning(' [*] '+(cluster.isMaster?'M':cluster.worker.id)+' | Code changed !');

            	// -> Reload only templates
            	if ( /templates\//.test(f) ) {
            		tools.log('[>] Reload templates...', 'purple')
            		_.each(vash.sites, function(site, name) {
            			//site.reloadTemplates()  ;
            			cluster.worker.destroy()
            		}) ;
            	}

            	// -> Reload only widgets
            	else if ( (/libs\/common\/widgets\//.test(f)) ) {
            		tools.log('[>] Reload widgets...', 'purple')
            		_.each(vash.sites, function(site, name) {
            			site.reloadWidgets()  ;
            			site.reloadAssets()  ;
            		}) ;
            	}

            	// -> Reload only assets
            	else if ( (/libs\/common\//.test(f)) || /public\//.test(f) ) {
            		tools.log('[>] Reload assets...', 'purple')
            		_.each(vash.sites, function(site, name) {
            			site.reloadAssets()  ;
            		}) ;
            	}

            	// -> Reload all server in other cases
            	shouldReload(f) ;

        	}
        })
        monitor.on("removed", function (f, stat) {
            tools.warning(' [*] '+(cluster.isMaster?'M':cluster.worker.id)+' | Code removed !');
            shouldReload(f); 
        })
    }) ;
}

// Init VaSH instance
GLOBAL.VaSH = VaSH; 

// Export class
module.exports = function(options) {
	if ( ! vash ) vash = new VaSH(options) ;
	return {
		get: function(req, res, next) {
			var request = vash.request(req, res, next) ;
	    }
	}
}
