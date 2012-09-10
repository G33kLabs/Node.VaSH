(function(exports) {

	var util = require('util') ;

	/////////////////////////////////////////////////////////////////////////
	// VaSH :: ADMIN CONTROLLER CLASS
	/////////////////////////////////////////////////////////////////////////

	exports.shared = Backbone.Model.extend({

		initialize: function(opts, instance) {
			console.log('ADMIN CONTROLLER REQUEST')

			// -> Check that user is allowed
			this.instance = instance ;
			if ( ! this.isAdmin() ) {
				return this.instance.error({
					content: "You are not allowed to be here...",
					name: this.instance.get('website').get('title')+ " &raquo; Access denied"
				})
			}

			//console.log(opts)
			//console.log(instance)
			var page = {
				full: true,
				title: 'VaSH Admin',
				name: 'VaSH Admin &raquo '+tools.ucfirst(instance.getSiteAlias()),
				desc: 'DashBoard Panel',
				content: 'yep'
			};

			instance.sendWithLayout({
				site: {
					menus: [{
						name: 'Home',
						url: '/'
					}]
				},
				page: page,
			})

			return this;
		},

		isAdmin: function() {
			var admins = this.instance.get('website').get('admins') ;
			var userid = this.instance.getUserId() ;
			return (admins.indexOf(userid)<0) ? false : true;
		}
	}); 

})(typeof global === "undefined" ? window : exports) ;