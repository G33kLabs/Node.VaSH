var fs = require('fs'),
	marked = require('marked'),
	jsHighlight = require("highlight").Highlight; ;

marked.setOptions({
	gfm: true,
	pedantic: false,
	sanitize: true,
	// callback for code highlighter
	highlight: function(code, lang) {
		if (lang === 'js') {
		  return jsHighlight(code);
		}
		return code;
	}
});

module.exports = Backbone.Model.extend({
	templates: {},
	initialize: function(options, cb) {
		var self = this;

		self.set('maxPerPage', 10) ;

		async.waterfall([

			// -> Read config file
			function(callback) {
				try {
					_.deepExtend(self.attributes, require(root_path+'/'+options.file)) ;
					callback() ;
				} catch(e) {
					callback(e) ;
				}
			},

			// -> Init page informations
			function(callback) {
    			self.set('page', {
					title: self.get('title'),
					desc: self.get('desc')
				})	
				callback(); 			
			},

			// -> Customize menus
			function(callback) {
	            _.each(self.attributes.menus, function(v,k) {
	                //if ( v.active ) v.active = 'active' ;
	                if ( ! v.url ) v.url = '/'+(v.name||'').toLowerCase()+'/'; 
	                self.attributes.menus[k] = v ;
	            })
	            callback() ;
			},

			// -> Load templates
			function(callback) {
				fs.readdir(self.get('public_path')+'/public', function(err, datas) {
			    	async.forEachSeries(datas, function(data, callback) {
			    		if ( ! /\.html$/.test(data) || /index\.html$/.test(data) ) return callback() ;
			    		fs.readFile(self.get('public_path')+'/public/'+data, 'utf8', function(err, tpl) {
			    			self.templates[data] = tpl ;
			    			callback() ;
			    		})		    		
			    	}, function() {
			    		callback() ;
			    	});
			    })
			},

			// -> Load posts
			function(callback) {
				self.posts = {} ;
				var post_path = self.get('public_path')+'/public/posts' ;
			    tools.walk(post_path, function(err, datas) {
			    	async.forEachSeries(datas, function(post, callback) {
			    		if ( ! /\.js$/.test(post.path) ) return callback() ;
			    		try {
			    			var _post = require(root_path+'/'+post.path) ;
			    			if ( /\.md$/.test(_post.content) ) {
			    				console.log(root_path+'/'+post_path+'/'+_post.content)
			    				_post.content = marked(fs.readFileSync(root_path+'/'+post_path+'/'+_post.content, 'utf8')) ;
			    			} 
			    			self.posts[_post.id] = _post ;
			    		} catch(e) {
			    			tools.error(e) ;
			    		}
			    		callback() ;
			    	}, function() {
			    		callback(null, self.posts) ;
			    	});
			    })
			}

		], function(err, success) {
			if ( err ) tools.error(err); 
			cb(err, success)
		})

		return this;
	},

	list: function(filters, callback) {
		var self = this, all = [], posts = [], out = '', page = {content: ''} ;

		// -> Sort posts by created date
		all = _.sortBy(self.posts, function(post){ return post.created }).reverse();

		// -> If want only a unique post
		console.log(self.attributes) ;
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
			posts = all.slice(0, self.get('maxPerPage')) ;
			page.title = self.get('title')+(filters.page>1?' - Page '+filters.page:'') ;
			page.name = self.get('title') ;
			page.desc = self.get('desc') ;
			page.author = self.get('authors')[self.get('author')]; 
		}

		// -> Build html
		if ( posts.length ) {
			_.each(posts, function(post) {
				post = new VaSH.Models.post(post, self) ;
				page.content += filters.permalink?post.html():post.teaser() ;
			})
		}

		// -> Return results
		callback(null, {
			widgets: [],
			page: page
		})
	},

	toJSON: function() {
		var exclude_keys = ['file', 'alias', 'static_extension', 'public', 'static_cache'] ;
		var out = {} ;
		_.each(this.attributes, function(item, key) {
			if ( exclude_keys.indexOf(key) < 0 ) out[key] = item ;
		})
		return out
	}
}) 