(function(exports) {

	var util = require('util') ;

	/////////////////////////////////////////////////////////////////////////
	// VaSH :: ADMIN CONTROLLER CLASS
	/////////////////////////////////////////////////////////////////////////

	exports.shared = Backbone.Model.extend({
		initialize: function(opts, instance) {
			this.siteObj = instance; 
			this.tpl = instance.templates['post.html'] 
			this.tpl_teaser = instance.templates['teaser.html'] 
			return this;
		}
	}); 

})(typeof global === "undefined" ? window : exports) ;