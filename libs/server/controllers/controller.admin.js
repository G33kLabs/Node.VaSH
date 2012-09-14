(function(exports) {

	var util = require('util') ;

	/////////////////////////////////////////////////////////////////////////
	// VaSH :: ADMIN CONTROLLER CLASS
	/////////////////////////////////////////////////////////////////////////

	exports.shared = Backbone.Model.extend({

		initialize: function(opts, instance) {
			var self = this ;

			tools.log('ADMIN CONTROLLER REQUEST', 'purple')

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
						site: {},
						page: {
							full: true,
							title: 'VaSH Center',
							name: 'VaSH Center &raquo '+tools.ucfirst(instance.getSiteAlias()),
							desc: 'Administration DashBoard'
						}
					}; 
					callback(null, view) ;
				},

				// -> Get posts
				function(view, callback) {
					var req_url = self.instance.get('req').url ;
					var req_path = self.instance.get('req').path ;
					var match = null;

					if ( /^\/admin\/articles$/.test(req_url) ) {
						view.page.desc = "List of blog posts";
						view.posts = _.map(self.instance.get('website').getOrdered(filters), function(post) {
							return (new VaSH.Models.post(post, self.instance.get('website'))).toJSON() ; 
						}); 
					}
					else if ( /^\/admin\/dashboard$/.test(req_path) ) {
						 
					}
					else if ( /^\/admin\/settings$/.test(req_path) ) {
						 
					}
					else if ( /^\/admin\/comments$/.test(req_path) ) {
						 
					}
					else if ( /^\/admin\/articles\/tags\/$/.test(req_path) ) {
						var query = tools.trim(self.instance.get('req').query.q || '') ;
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

					/*================================================================= EDIT */
					else if ( match = req_path.match(/^\/admin\/articles\/edit\/(.*)/) ) {
						view.page.desc = "Edit mode is \"on\" ;)";
						filters.id = match[1] ;
						tools.log('[ ] Edit : '+filters.id, 'purple')
						self.instance.get('website').list(filters, function(err, datas) {
							if ( datas.posts && datas.posts[0] ) {
								view.edit = datas.posts[0] ;
								//console.log(view.edit)
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

					/*================================================================= CREATE */
					else if ( match = req_path.match(/^\/admin\/articles\/create\/(.*)/) ) {
						view.page.desc = "Let's go to change the world ! ;)";
						filters.id = match[1] ;
						if ( filters.id == 'new' || filters.id == 'draft' ) filters.id = tools.md5(tools.rand(10000000000000)+'') ;
						tools.log('[ ] Create a new post : '+filters.id+'...', 'purple'); 
						view.edit = {
							id: filters.id,
							disabled: filters.id=='draft'?'yes':'no',
							isDisabled: filters.id=='draft'?true:false,
							created: Date.now(),
							isNew: true
						}
						callback(null, view) ;
						return;
					}

					/*================================================================= INDEX */
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
						'/common/vendors/tokeninput/token-input-mac.css',
						'/common/vendors/jquery-ui-1.8.23.custom/ui-lightness/jquery-ui-1.8.23.custom.css'
					] ;
					view.site.js_addon = [
						'/common/vendors/markdown/markdown.js', 
						'/common/vendors/jquery.textarea.js', 
						'http://yandex.st/highlightjs/7.2/highlight.min.js',
						'/common/vendors/tokeninput/jquery.tokeninput.js',
						'/common/vendors/jquery-ui-1.8.23.custom/jquery-ui-1.8.23.custom.min.js',
						'/common/vendors/jquery-ui-1.8.23.custom/jquery-ui-timepicker-addon.js',
						'/common/js/admin.js'
					] ;
					callback(null, view) ;
				},

				// -> Received a POST request 
				function(view, callback) {
					var item = view.edit ;
					if ( instance.get('req').method == 'POST' ) {

						console.log('[>] Update '+item.id)
						console.log('[>] ----------------------------------')
						//console.log('[>] '+json(instance.get('req').body))
						console.log('[>] ----------------------------------')

						var rawModelKeys = (new VaSH.Models.post()).getModel() ;
						var rawDatas = instance.get('req').body ;

						//console.log(rawDatas)

						// -> Check if required datas are here
						if ( ! rawDatas.id ) {
							return callback({json: { error: 'You must provide an id to your post !' }});
						}
						else if ( ! rawDatas.delete && (! rawDatas.title || rawDatas.title.length < 3) ) {
							return callback({json: { error: 'You must provide a title greater than 3 characters !' }});
						}
						else if ( ! rawDatas.delete && (! rawDatas.raw || rawDatas.raw.length < 10) ) {
							return callback({json: { error: 'Please type something in the content !' }});
						}

						// -> Read post file
						self.instance.get('website').getPost(item.id, function(err, rawOld) {

							// -> Declare output as json
							view.json = {} ;
							if ( item.isNew ) {
								err = null;
							}

							// -> If err exir
							if ( err ) {
								view.json.error = err ;
								return callback(view);
							}

							//console.log(rawOld)

							// -> Prepare new data only if changes
							var datas = {}, changes = [] ;
							_.each(rawModelKeys, function(key) {
								if ( rawOld && rawOld[key] ) datas[key] = rawOld[key] || false ;
								if ( ! rawOld || ! rawOld[key] || (rawOld[key] != rawDatas[key]) ) {
									changes.push(key) ;
									console.log('[*] Key ['+key+'] changed !')
									if ( key == 'thumb' && (/^data\:image/).test(rawDatas[key]) ) {
										var regex = /^data:.+\/(.+);base64,(.*)$/;
										var matches = rawDatas[key].match(regex);
										var ext = matches[1];
										var data = matches[2];
										datas[key] = {
											file: item.id+'_thumb.jpg',
											binary: new Buffer(data, 'base64')
										}
									}
									else {
										datas[key] = rawDatas[key] ;
									}
								}
							}) ;

							// -> Delete it ?
							if ( rawDatas.delete ) {
								self.instance.get('website').delPost(datas, function(err, datas) {
									delete view.edit ;
									view.delete = true ;
									view.json.error = err ;
									view.json.success = datas ;
									callback(null, view) ;
								})
								return ;
							}

							// -> Prepare json output
							view.json.changes = changes ;
							view.edit = datas ;

							// -> If changes, store post
							if ( changes.length ) {
								datas.updated = (new Date()).getTime(); 
								self.instance.get('website').setPost(datas, function(err, success) {
									//console.log(datas, success) ; 
									view.json.error = err ;
									view.json.success = success  ;
									callback(null, view) ;									
								}) ;
							}
							else {
								callback(null, view) ;	
							}

						})				

					}
					else {
						callback(null, view) ;
					}
				},

				// -> If refresh post is needed after an update
				function(view, callback) {
					if ( ! view.json || ! view.json.success || ! view.json.success.post ) return callback(null, view) ;
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
				},

				// -> Build template
				function(view, callback) {
					//console.log("--------------", view)

					// -> Create page output
					view.page.content = VaSH.Mustache.to_html(instance.get('website').templates['admin.html']||'', view); 

					// -> Append datas if json
					if ( view.json ) {
						view.json.export = {
							page: view.page,
							edit: view.edit
						} ;
					}

					// -> Return page
					callback(null, view) ;	

				}
			], function(err, res) {
				if ( err )  instance.error(err)
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