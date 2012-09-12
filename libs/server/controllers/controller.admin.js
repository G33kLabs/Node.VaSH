(function(exports) {

	var util = require('util') ;

	/////////////////////////////////////////////////////////////////////////
	// VaSH :: ADMIN CONTROLLER CLASS
	/////////////////////////////////////////////////////////////////////////

	exports.shared = Backbone.Model.extend({

		initialize: function(opts, instance) {
			var self = this ;

			console.log('ADMIN CONTROLLER REQUEST')

			// -> Check that user is allowed
			self.instance = instance ;
			if ( ! this.isAdmin() ) {
				return this.instance.error({
					content: "You are not allowed to be here...",
					name: self.instance.get('website').get('title')+ " &raquo; Access denied"
				})
			}

			// -> Define filters to apply
			var filters = _.extend({
				page: self.instance.get('req').query.page||1,
				cat: null,
				all: true,
				by: 'created',
				desc: true
			}) ;

			// -> Waterfall for rendering admin page
			async.waterfall([

				// -> Init view
				function(callback) {
					var view = {
						site: {}
					}; 
					callback(null, view) ;
				},

				// -> Get posts
				function(view, callback) {
					var req_url = self.instance.get('req').url ;
					var req_path = self.instance.get('req').path ;

					if ( /^\/admin\/articles\/$/.test(req_url) ) {
						view.posts = _.map(self.instance.get('website').getOrdered(filters), function(post) {
							return (new VaSH.Models.post(post, self.instance.get('website'))).toJSON() ; 
						}); 
					}
					else if ( /^\/admin\/dashboard\/$/.test(req_path) ) {
						 
					}
					else if ( /^\/admin\/settings\/$/.test(req_path) ) {
						 
					}
					else if ( /^\/admin\/articles\/tags\/$/.test(req_path) ) {
						var query = self.instance.get('req').query.q || '' ;
						var tags = [] ;

						// -> Format query
						if ( query.toLowerCase() == query ) query = tools.ucfirst(query) ;

						// -> Get tags
						_.each(self.instance.get('website').posts, function(post) {
							_.each(post.tags, function(tag) {
								if ( tags.indexOf(tag) >= 0 ) return;
								if ( ! (new RegExp(query, 'i')).test(tag) ) return;
								tags.push(tag) ;
							})
						}) ;

						// -> If no tags, add query as a tag
						tags = tags.sort().slice(0, 10) ;
						if ( ! tags.length || tags.indexOf(query) < 0 ) {
							tags.push(query); 
						}

						// -> Map response
						tags = _.map(tags, function(tag) {
							return {
								name: tag,
								id: tag
							}
						}) ;

						// -> Store it for json output
						view.json = tags ;
					}
					else if ( /^\/admin\/articles\/edit\/$/.test(req_path) ) {
						console.log(self.instance.get('req').query.id)
						filters.id = self.instance.get('req').query.id ;
						self.instance.get('website').list(filters, function(err, datas) {
							if ( datas.posts && datas.posts[0] ) {
								view.edit = datas.posts[0] ;
								if ( view.edit.tags.length ) 
									view.edit.tags = _.map(view.edit.tags, function(tag) { return tag.name}).join(',')
								else {
									view.edit.tags = '' ;
								}
							}
							callback(null, view) ;
						}); 
						return;
					}
					else {
						view.empty = true ;
					}

					// -> Logs
					//console.log(req_url, req_path) ;
					
					// -> Callback for general cases
					callback(null, view) ;
				},

				// -> Set Admins menus and add assets addons for admin purposes only
				function(view, callback) {
					view.site.menus = self.getMenus() ;
					view.site.css_addon = [
						'/common/css/admin.css',
						'/common/vendors/tokeninput/token-input.css',
						'/common/vendors/tokeninput/token-input-mac.css'
					] ;
					view.site.js_addon = [
						'/common/vendors/markdown/markdown.js', 
						'/common/vendors/jquery.textarea.js', 
						'http://yandex.st/highlightjs/7.2/highlight.min.js',
						'/common/vendors/tokeninput/jquery.tokeninput.js',
						'/common/js/admin.js'
					] ;
					callback(null, view) ;
				},

				// -> Build template
				function(view, callback) {
					//console.log("--------------", view)

					// -> Create page output
					view.page = {
						full: true,
						title: 'VaSH Admin',
						name: 'VaSH Admin &raquo '+tools.ucfirst(instance.getSiteAlias()),
						desc: 'DashBoard Panel',
						content: VaSH.Mustache.to_html(instance.get('website').templates['admin.html']||'', view)
					};			

					// -> Return page
					callback(null, view) ;	

				}
			], function(err, res) {
				if ( err )  instance.error()
				else if (res.plainText) instance.get('res').end(res.plainText)
				else if (res.json) instance.get('res').json(res.json)
				else instance.sendWithLayout(res); 
			}) ;

			return this;
		},

		getMenus: function() {
			return [{
				name: 'Dashboard',
				url: '#admin-dashboard',
				id: 'dashboard',
				icon: 'th-large'
			}, {
				name: 'Settings',
				url: '#admin-settings',
				id: 'settings',
				icon: 'wrench'
			}, {
				name: 'Articles',
				url: '#admin-articles',
				id: 'articles',
				icon: 'edit'
			}, {
				name: 'Comments',
				url: '#admin-comments',
				id: 'comments',
				icon: 'comment'
			}] ;
		},

		isAdmin: function() {
			var admins = this.instance.get('website').get('admins') ;
			var userid = this.instance.getUserId() ;
			return (admins.indexOf(userid)<0) ? false : true;
		}
	}); 

})(typeof global === "undefined" ? window : exports) ;