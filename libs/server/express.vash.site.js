var fs = require('fs'),
	noop = function() {},
	marked = require(root_path+'/libs/common/vendors/markdown/'),
	jsHighlight = require("highlight").Highlight,
	zlib = require('zlib'),
	htmlPacker = require('html-minifier').minify,
	jsParser = require("uglify-js").parser,
	jsPacker = require("uglify-js").uglify,
	cssPacker = require('uglifycss') ;

marked.setOptions({
	gfm: true,
	pedantic: false,
	sanitize: false,
	// callback for code highlighter
	highlight: function(code, lang) {
		return jsHighlight(code);
	}
});

module.exports = Backbone.Model.extend({
	templates: {},
	widgets: [],
	defaults: {
		maxPerPage: 10
	},
	initialize: function(options, cb) {
		var self = this;

		self.posts = {} ;

		async.waterfall([

			// -> Read config file
			function(callback) {
				self.reloadConfig(callback)
			},

			// -> Load templates
			function(callback) {
				self.reloadTemplates(callback)
			},

			// -> Load widgets
			function(callback) {
				self.reloadWidgets(callback)
			},

			// -> Load assets
			function(callback) {
				self.reloadAssets(callback)
			},

			// -> Load posts
			function(callback) {
				self.reloadPosts(callback)
			}

		], function(err, success) {
			if ( err ) tools.error(err); 
			cb(err, success)
		})

		return this;
	},

	reloadConfig: function(callback) {
		var self = this;
		callback = callback || noop;
		try {

			// -> Get config file
			self.attributes = tools.extend({}, self.attributes, require(root_path+'/'+self.get('configFile'))) ;

			// -> Wrap menus
			_.each(self.attributes.menus, function(v,k) {
				if ( _.isString(v) ) v = {name:v} ;
	            if ( v.active ) v.active = 'active' ;
	            if ( v.name ) v.id = tools.permalink(v.name||'') ;
	            if ( ! v.icon ) v.icon = tools.permalink(v.name||'') ;
	            if ( ! v.url ) {
	            	if ( v.id == 'home' ) v.url = '/';
	            	else v.url = '/'+v.id+'/'; 
	            }
	            self.attributes.menus[k] = v ;
	        })	

	        // -> Set author
	        self.set('author_email', self.get('author')) ;
	        self.set('author', self.get('authors')[self.get('author')]) ;

	        // -> Return
	        callback() ;

		} catch(e) {
			callback(e) ;
		}
	},

	reloadTemplates: function(callback) {
		var self = this ;
		callback = callback || noop;
		fs.readdir(self.get('public_path')+'/templates', function(err, datas) {
	    	async.forEachSeries(datas, function(data, callback) {
	    		if ( ! /\.html$/.test(data) ) return callback() ;
	    		fs.readFile(self.get('public_path')+'/templates/'+data, 'utf8', function(err, tpl) {
	    			self.templates[data] = tpl ;
	    			callback() ;
	    		})		    		
	    	}, function() {
	    		callback() ;
	    	});
	    })
	},

	reloadWidgets: function(callback) {
		var self = this,
			widgetPath = root_path+'/libs/common/widgets',
			widgetFilename ;

		callback = callback || noop;
		self.widgets = [] ;
		fs.readdir(widgetPath, function(err, datas) {
	    	async.forEachSeries(datas, function(data, callback) {

	    		// -> If widget is in list => skip
	    		if ( self.get('widgets').indexOf(data) < 0 ) return callback() ;

	    		// -> Get files to load
	    		widgetFilename = widgetPath+'/'+data+'/widget.'+data+'.js' ;
	    		widgetTemplate = widgetPath+'/'+data+'/widget.'+data+'.html' ;
	    		widgetStyle = widgetPath+'/'+data+'/widget.'+data+'.css' ;

	    		// -> Load files
	    		async.parallel({
	    			css: function(callback) {
	    				fs.exists(widgetStyle, function(exists) {
			    			if ( exists ) {
	    						self.get('assets').css.push(widgetStyle.split(root_path)[1]) ;
			    			}
			    			callback(null, true) ;
			    		}); 
	    			},
	    			register: function(callback) {
			    		fs.exists(widgetFilename, function(exists) {
			    			var widget ;
			    			if ( exists ) {
			    				tools.log('Register widget :: '+'widget.'+data+'.js') ;
			    				self.get('assets').js.push(widgetFilename.split(root_path)[1]) ;
			    				widget = new (require(widgetFilename).widget)(_.extend({}, self.attributes, {templates: self.templates})) ;
			    				
			    			}
			    			callback(null, widget) ;
			    		}); 	    				
	    			},
	    			template: function(callback) {
			    		fs.exists(widgetTemplate, function(exists) {
			    			if ( exists ) {
			    				tools.log('Register widget template :: '+'widget.'+data+'.html') ;
			    				fs.readFile(widgetTemplate, 'utf8', function(err, content) {
			    					callback(null, content)
			    				})
			    			}
			    			else {
			    				callback(null) ;
			    			}
			    		}); 	    				
	    			}
	    		}, function(err, success) {
	    			if ( success.register ) self.widgets.push(success.register) ;
	    			if ( success.template ) self.templates['widget.'+data+'.html'] = success.template ;
	    			callback() ;
	    		})

	    	}, function() {

	    		var orderedWidgets = [] ;
	    		_.each(self.get('widgets'), function(data) {
	    			var widget = _.find(self.widgets, function(val) {
	    				return val.id == data;
	    			})
	    			if ( widget ) orderedWidgets.push(widget) ;
	    		})
	    		self.widgets = orderedWidgets ;

	    		callback() ;
	    	});
	    })

	},

	reloadPosts: function(callback) {
		var self = this;
		var post_path = self.get('public_path')+'/posts' ;
		callback = callback || noop;
	    tools.walk(post_path, function(err, datas) {
	    	if ( ! datas || ! datas.length ) {
	    		tools.warning('No posts in '+post_path) ;
	    		return callback();
	    	}
	    	async.forEachSeries(datas, function(post, callback) {
	    		if ( ! /\.js$/.test(post.path) ) return callback() ;
	    		try {
	    			var postId = post.path.replace(/\.js/, '').split('/').pop() ;
	    			self.getPost(postId, function(err, datas) {
	    				self.posts[datas.id] = datas ;
						if ( /\.md$/.test(datas.content) ) {
		    				fs.readFile(root_path+'/'+post_path+'/'+datas.content, 'utf8', function(err, content) {
		    					self.posts[datas.id].raw = content ;
		    					if ( ! err ) self.posts[datas.id].content =  marked(content); 
		    					callback() ;
		    				})
		    			} 
		    			else {
		    				callback() ;
		    			}

	    			}) ;
	    			
	    		} catch(e) {
	    			tools.error(e) ;
	    			callback(e) ;
	    		}
	    		
	    	}, function() {
	    		callback(null, self.posts) ;
	    	});
	    })		
	},

	getPost: function(id, callback) {
		var self = this;
		var post_path = self.get('public_path')+'/posts' ;
		callback = callback || noop;
		try {
			fs.readFile(root_path+'/'+post_path+'/'+id+'.js', 'utf8', function(err, datas) {
				if ( err || ! datas ) return callback('No datas in file !') ;
				try { eval('datas='+datas.replace(/\n/g, '')) } catch(e) {}
				if ( datas && datas.raw ) datas.content = marked(datas.raw); 
				callback(null, datas) ;
			}) ;			
		} catch(e) {
			callback(e) ;
		}
	},

	setPost: function(post, callback) {
		var self = this;
		var post_path = self.get('public_path')+'/posts' ;
		callback = callback || noop;

		// -> No id ? Out !
		if ( ! post || ! post.id ) {
			return callback('You should provide an id to the post !') ;
		}

		// -> If thumb sended
		async.series({
			createdir: function(callback) {
				mkdirp(post_path, function(err, success) {
				    callback(err, success)
				}); 
			},
			thumb: function(callback) {
				if ( post.thumb && post.thumb.binary ) {
					tools.log('[>] Store thumb : '+'/'+post_path+'/'+post.thumb.file, 'purple')
					fs.writeFile(root_path+'/'+post_path+'/'+post.thumb.file, post.thumb.binary, function(err, success) {
						post.thumb = post.thumb.file ;
						callback(err, true); 
					})
				}
				else callback() ;
			},
			post: function(callback) {
				tools.log('[>] Store post : '+'/'+post_path+'/'+post.id+'.js', 'purple')
				post.created = parseInt(post.created) ;
				post.disabled = post.disabled == 'yes' ? 'yes' : 'no' ;
				fs.writeFile(root_path+'/'+post_path+'/'+post.id+'.js', JSON.stringify(post, null, 4), 'utf8', function(err, success) {
					if ( ! err ) {
						if ( post && post.raw ) post.content = marked(post.raw); 
						self.posts[post.id] = post ;
					}
					callback(err, true); 
				})
			}
		}, function(err, success) {
			callback(err, success); 
		}); 
	},

	delPost: function(post, callback) {
		var self = this;
		var post_path = self.get('public_path')+'/posts' ;
		callback = callback || noop;

		// -> No id ? Out !
		if ( ! post || ! post.id ) {
			return callback('You should provide an id to the post !') ;
		}

		// -> Remove from posts
		delete self.posts[post.id]  ;

		// -> If thumb sended
		async.series({
			delete_thumb: function(callback) {
				if ( post.thumb ) {
					var filePath = '/'+post_path+'/'+post.id+'_thumb.jpg' ;
					tools.log('[>] Delete thumb : '+filePath, 'purple')
					fs.exists(root_path+'/'+filePath, function(exists) {
						if ( exists ) fs.unlink(root_path+'/'+filePath, function() {
							callback(null, true); 
						})
						else callback(null, true);
					}) ;					
				}
				else callback() ;
			},
			delete_post: function(callback) {
				var filePath = '/'+post_path+'/'+post.id+'.js' ;
				tools.log('[>] Delete post : '+filePath, 'purple')
				fs.exists(root_path+'/'+filePath, function(exists) {
					if ( exists ) fs.unlink(root_path+'/'+filePath, function() {
						callback(null, true); 
					})
					else callback(null, true);
				}) ;	
			}
		}, function(err, success) {
			callback(err, success); 
		}); 
	},

	reloadAssets: function(callback) {
		var self = this ;
		callback = callback || noop;
		async.series({
			css: function(callback) {
				var out = [] ;
				async.forEachSeries(self.get('assets').css, function(file, callback) {

					file = file.replace(/^\/common/, '/libs/common') ;
					file = file.replace(/^\/assets/, '/'+self.get('public_path')+'/public/assets') ;

					//console.log(root_path+file) ;

					fs.readFile(root_path+file, 'utf8', function(err, datas) {
						if ( ! err && datas ) out.push("/*** "+file+" ***/\n"+datas) ;
						else tools.error('[!] Error while minifying this file :: '+file+' | '+err)
						callback(); 
					}) ;
					
				}, function() {
					if ( out.length ) {
						callback(null,  self.packCSS(out.join("\n")) )
					}
					else {
						callback(true) ;
					}
				})				
			},
			js: function(callback) {
				var out = [] ;
				async.forEachSeries(self.get('assets').js, function(file, callback) {

					file = file.replace(/^\/common/, '/libs/common') ;
					file = file.replace(/^\/assets/, '/'+self.get('public_path')+'/public/assets') ;

					//console.log(root_path+file) ;

					fs.readFile(root_path+file, 'utf8', function(err, datas) {
						if ( ! err && datas ) out.push("/*** "+file+" ***/;\n"+datas) ;
						else tools.error('[!] Error while minifying this file :: '+file+' | '+err)
						callback(); 
					}) ;

				}, function() {
					if ( out.length ) {
						callback(null,  self.packJS(out.join("\n")) )
					}
					else {
						callback(true) ;
					}
				})				
			}
		}, function(err, res) {
			//console.log(err, res)

			async.series({
				css: function(callback) {
					if ( res.css ) {
						var cssMinify = root_path+'/'+self.get('public_path')+'/public/assets/css/app.min.css' ;
						//console.log(res.css)
						tools.log('[>] Write CSS minified to : '+cssMinify.split(root_path)[1]) ;
						fs.writeFile(cssMinify, res.css, 'utf8', function(err) {
							callback(err, true) ;
						})
					}
					else callback() ;
				},
				js: function(callback) {
					if ( res.js ) {
						var jsMinify = root_path+'/'+self.get('public_path')+'/public/assets/js/app.min.js' ;
						tools.log('[>] Write JS minified to : '+jsMinify.split(root_path)[1]) ;
						fs.writeFile(jsMinify, res.js, 'utf8', function(err) {
							callback(err, true) ;
						})
					}
					else callback() ;
				}
			}, function(err, res) {
				callback() ;
			})

		})

	},

	// Pack CSS content 
	packCSS: function(content) {
		//if ( this.compileError ) return false;
		return cssPacker.processString(content) ;
	},

	// Pack HTML content 
	packHTML: function(content) {
		//if ( this.compileError ) return false;
		var htmlPacker = require('html-minifier').minify ;
		//console.log(htmlPacker(content, { removeComments: true, collapseWhitespace: true, removeEmptyAttributes: true })) ;
		return htmlPacker(content, { removeComments: true, collapseWhitespace: true, removeEmptyAttributes: true }) ;
	},

	// Pack JS content
	packJS: function(content, itemPath) {

		try {
			var ast = jsParser.parse(content); // parse code and get the initial AST
			ast = jsPacker.ast_mangle(ast); // get a new AST with mangled names
			ast = jsPacker.ast_squeeze(ast); // get an AST with compression optimizations
		} catch(e) { 

			// -- Scope error
			tools.error('-------------------------') ;
			tools.error(content.split("\n").slice(e.line-10, e.line-1).join("\n")) ;
			tools.warning(" /******** "+e.line+" >> "+e.message+" ********/") ;
			tools.warning((content.split("\n").slice(e.line-1, e.line).join("\n"))) ;
			tools.warning(" /***********************************************************/") ;
			tools.error(content.split("\n").slice(e.line, e.line+10).join("\n")) ;
			this.compileError = true ;
			require('child_process').exec('say -v Alex -r 200 "What the fuck baby ? "') ;
			//process.exit() ;
			
		} 
		return jsPacker.gen_code(ast); // compressed code here
	},

	getOrdered: function(filters) {
		filters = _.extend({}, {by: 'created', desc: true}, filters);
		var sortedPosts = _.clone(this.posts) ;
		sortedPosts = _.filter(sortedPosts, function(post){ 
			if ( post.disabled && post.disabled == 'yes' && ! filters.all ) return false;
			if ( ! filters.cat ) return true;
			if ( ! _.isArray(post.tags) ) return false;
			for ( var i = 0 ; i < post.tags.length ; i++ ) {
				if ( filters.cat == tools.permalink(post.tags[i]) ) {
					return true;
				}
			}
		}) ;
		sortedPosts = _.sortBy(sortedPosts, function(post){ return post[filters.by] }) ;
		return filters.desc ? sortedPosts.reverse() : sortedPosts;
	},

	list: function(filters, callback) {
		var self = this, all = [], posts = [], out = '', page = {content: ''} ;

		// -> Sort posts by created date
		all = self.getOrdered(filters) ;

		// -> If want only a unique post
		//console.log(self.attributes) ;
		if ( filters.permalink || filters.id ) {
			var post = _.find(all, function(post){ 
				if ( filters.permalink ) return tools.permalink(post.title) == filters.permalink; 
				else if ( filters.id ) return tools.permalink(post.id) == filters.id; 
				else return false;
			});
			posts.push(post) ;
			post = new VaSH.Models.post(post, self) ; 
			page.title = post.getTitle() + ' | ' + self.get('title') ;
			page.name = post.getTitle() ;
			page.desc = self.get('title')+ " > "+post.getDesc()  ;
			page.author = self.get('authors')[post.get('author')]; 
			page.canonical = post.getLink() ;
			page.shortlink = post.getShortLink() ;
			page.image = post.getThumbnail() ;
			page.seo_desc = ( 140 > page.desc.length ? ' : '+post.getRSSTeaser(200-page.desc.length, '...') : '' );
		}

		// -> Select posts to display
		else {
			posts = all.slice(Math.max(0, (filters.page-1)*self.get('maxPerPage')), self.get('maxPerPage')) ;
			page.title = self.get('title')+(filters.cat?' - '+filters.cat:'')+(filters.page>1?' - Page '+filters.page:'') ;
			page.name = self.get('title')+(filters.cat?' > '+tools.ucfirst(filters.cat):'') ;
			page.desc = self.get('desc') ;
			if ( filters.cat ) {
				page.desc = VaSH.Mustache.to_html(self.get('desc_category'), {
					cat: tools.ucfirst(filters.cat),
					page_count: (filters.page>1?filters.page:false)
				});
				if ( posts.length ) {
					page.seo_desc = ' : '+(_.map(posts.slice(0, 3), function(post) {
						return post.title
					})).join(', ')+'...'
				}
				page.canonical = '/'+filters.cat+'/' ;
			}
			page.author = self.get('authors')[self.get('author')]; 
		}

		// -> Build html
		if ( posts.length ) {
			_.each(posts, function(post, key) {
				post = post || {} ;
				post.isAdmin = filters.isAdmin ;
				post = new VaSH.Models.post(post, self) ;
				page.content += filters.permalink?post.html():post.teaser() ;
				posts[key] = post.toJSON() ;
			})
		} else {
			page.errorCode = 404 ;
			page.content = "<div class='alert alert-block alert-error'><h4>No content found !</h4>Sorry but there is no content linked to your search :( </div>"; 
		}

		// -> Return results
		callback(null, {
			page: _.clone(page),
			posts: posts
		})
	},

	feed: function(callback) {
		var self = this, all = [], posts = [], out = '', opts = {posts:[]} ;

		// -> Get an ordered list
		all = self.getOrdered() ;

		// -> Taks first ones
		posts = all.slice(0, self.get('maxPerPage')) ;

		// -> Get posts
		if ( posts.length ) {
			_.each(posts, function(post) {
				opts.posts.push((new VaSH.Models.post(post, self)).toRSS()) ;
			})
		}

		// -> Build feed infos
		opts.feed = {
			title: self.get('title'),
			description: self.get('desc'),
			url: self.getBaseUrl()+'/feed/',
			website: self.getBaseUrl(),
			language: self.get('language'),
			updatePeriod: 'hourly',
			updateFrequency: 1,
			lastBuildDate: opts.posts[0].pubDate,
			generator: 'http://www.js2node.com/'
		}	

		// -> Build RSS
		out = VaSH.Mustache.to_html(self.templates['rss.html'], opts) ;

		// -> COmpile template
		callback(null, out)
	},

	sitemap: function(callback) {

		var self = this, urls = [], paths = [] ;

		var priorities = {
			'hourly': 1,
			'daily': 0.8,
			'weekly': 0.5,
			'monthly': 0.1
		}

		var addSitemap = function(url, freq, priority) {
			if ( paths.indexOf(url) < 0 ) {
				freq = freq || 'monthly' ;
				priority = priority || priorities[freq] || 'monthly' ;
				paths.push(url) 
				urls.push({
					url: self.getBaseUrl()+url,
					freq: freq,
					priority: priority
				})
			}
		}

		// -> Add homepage
		addSitemap('/', 'hourly', 1) ;

		// -> Add menus
		_.each(self.get('menus'), function(menu, key) {
			addSitemap(menu.url, 'daily') ;
		})

		// -> Add posts and tags
		_.each(self.posts, function(post) {
			var _post = (new VaSH.Models.post(post, self)).getLink() ;
			addSitemap(_post, 'weekly') ;
			if ( post.tags ) {
				_.each(post.tags, function(tag) {
					addSitemap('/'+tools.permalink(tag), 'daily') ;
				})
			}
		}) ;

		// -> Build XML
		var xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
	    for (var i in urls) {
	        xml += '<url>';
	        xml += '<loc>'+ urls[i].url + '</loc>';
	        xml += '<changefreq>'+ urls[i].freq +'</changefreq>';
	        xml += '<priority>'+ urls[i].priority +'</priority>';
	        xml += '</url>';
	        i++;
	    }
	    xml += '</urlset>';

		// -> COmpile template
		callback(null, xml);
	},

	getBaseUrl: function() {
		return ( this.get('env') == 'dev' && this.get('local') ) ? this.get('local') : this.get('website') ;
	},

	toJSON: function() {
		var exclude_keys = ['configFile', 'alias', 'static_extension', 'public', 'cache', 'passport'] ;
		var out = {} ;
		_.each(this.attributes, function(item, key) {
			if ( key == 'js_addon' ) out[key] = item.join('|')
			else if ( exclude_keys.indexOf(key) < 0 ) out[key] = item ;
		})
		return out
	}
}) 