var fs = require('fs'),
	marked = require('marked'),
	jsHighlight = require("highlight").Highlight; ;

marked.setOptions({
	gfm: true,
	pedantic: false,
	sanitize: true,
	// callback for code highlighter
	highlight: function(code, lang) {
		return jsHighlight(code);
	}
});

module.exports = Backbone.Model.extend({
	templates: {},
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
		try {

			// -> Get config file
			self.attributes = tools.extend({}, self.attributes, require(root_path+'/'+self.get('configFile'))) ;

			// -> Wrap menus
			_.each(self.attributes.menus, function(v,k) {
	            if ( v.active ) v.active = 'active' ;
	            if ( v.name ) v.id = tools.permalink(v.name||'') ;
	            if ( ! v.url ) v.url = '/'+v.id+'/'; 
	            self.attributes.menus[k] = v ;
	        })	

	        // -> Return
	        callback() ;

		} catch(e) {
			callback(e) ;
		}
	},

	reloadTemplates: function(callback) {
		var self = this ;
		fs.readdir(self.get('public_path')+'/public', function(err, datas) {
	    	async.forEachSeries(datas, function(data, callback) {
	    		if ( ! /\.html$/.test(data) ) return callback() ;
	    		fs.readFile(self.get('public_path')+'/public/'+data, 'utf8', function(err, tpl) {
	    			self.templates[data] = tpl ;
	    			callback() ;
	    		})		    		
	    	}, function() {
	    		callback() ;
	    	});
	    })
	},

	reloadPosts: function(callback) {
		var self = this;
		var post_path = self.get('public_path')+'/posts' ;
	    tools.walk(post_path, function(err, datas) {
	    	async.forEachSeries(datas, function(post, callback) {
	    		if ( ! /\.js$/.test(post.path) ) return callback() ;
	    		try {
	    			var _post = require(root_path+'/'+post.path) ;
	    			self.posts[_post.id] = _post ;
	    			if ( /\.md$/.test(_post.content) ) {
	    				//console.log(root_path+'/'+post_path+'/'+_post.content)
	    				fs.readFile(root_path+'/'+post_path+'/'+_post.content, 'utf8', function(err, content) {
	    					if ( ! err ) self.posts[_post.id].content =  marked(content); 
	    					callback() ;
	    				})
	    			} 
	    			else {
	    				callback() ;
	    			}
	    		} catch(e) {
	    			tools.error(e) ;
	    			callback(e) ;
	    		}
	    		
	    	}, function() {
	    		callback(null, self.posts) ;
	    	});
	    })		
	},

	getOrdered: function(filters) {
		filters = _.extend({}, {by: 'created', desc: true}, filters);
		var sortedPosts = _.clone(this.posts) ;
		sortedPosts = _.filter(sortedPosts, function(post){ 
			if ( post.disabled ) return false;
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
		if ( filters.permalink ) {
			var post = _.find(all, function(post){ return tools.permalink(post.title) == filters.permalink; });
			posts.push(post) ;
			post = new VaSH.Models.post(post, self) ; 
			page.title = post.getTitle() + ' | ' + self.get('title') ;
			page.name = post.getTitle() ;
			page.desc = self.get('title')+ " > "+post.getDesc()  ;
			page.author = self.get('authors')[post.get('author')]; 
		}

		// -> Select posts to display
		else {
			posts = all.slice(Math.max(0, (filters.page-1)*self.get('maxPerPage')), self.get('maxPerPage')) ;
			page.title = self.get('title')+(filters.cat?' - '+filters.cat:'')+(filters.page>1?' - Page '+filters.page:'') ;
			page.name = self.get('title')+(filters.cat?' > '+tools.ucfirst(filters.cat):'') ;
			page.desc = self.get('desc') ;
			page.author = self.get('authors')[self.get('author')]; 
		}

		// -> Build html
		if ( posts.length ) {
			_.each(posts, function(post) {
				post = new VaSH.Models.post(post, self) ;
				page.content += filters.permalink?post.html():post.teaser() ;
			})
		} else {
			page.errorCode = 404 ;
			page.content = "<div class='error'>Sorry but there is a mistake with this page ! </div>"; 
		}

		// -> Return results
		callback(null, {
			widgets: [],
			page: _.clone(page)
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

	getBaseUrl: function() {
		console.log(this.get('env'), this.get('website'), this.get('local'))
		return ( this.get('env') == 'dev' && this.get('local') ) ? this.get('local') : this.get('website') ;
	},

	toJSON: function() {
		var exclude_keys = ['configFile', 'alias', 'static_extension', 'public', 'cache', 'passport'] ;
		var out = {} ;
		_.each(this.attributes, function(item, key) {
			if ( exclude_keys.indexOf(key) < 0 ) out[key] = item ;
		})
		return out
	}
}) 