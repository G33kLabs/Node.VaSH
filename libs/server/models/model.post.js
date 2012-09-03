(function(exports) {

	var util = require('util') ;

	/////////////////////////////////////////////////////////////////////////
	// VaSH :: POST CLASS
	/////////////////////////////////////////////////////////////////////////

	exports.shared = Backbone.Model.extend({
		initialize: function(opts, instance) {
			this.tpl = instance.templates['post.html'] 
			this.tpl_teaser = instance.templates['teaser.html'] 
			return this;
		},
		getTitle: function() {
			return tools.ucwords(this.get('title'))
		},
		getTeaser: function(max) {
			max = max || 200 ;
			var txt = tools.teaser(this.get('content'), max).replace(/(<([^>]+)>)/ig," ");
			return tools.trim(txt)+(txt.length>max?' <small>[...]</small>':'');
		},
		getCategory: function() {
			var mainTag = 'General' ;
			if ( _.isArray(this.get('tags')) ) {
				mainTag = _.first(this.get('tags')) ;
			}
			return mainTag ;
		},
		getDesc: function() {
			return this.get('desc')
		},
		getLink: function() {
			return '/'+this.getCategory()+'/'+tools.permalink(this.get('title'))
		},
		teaser: function() {
			return VaSH.Mustache.to_html(this.tpl_teaser, {post: this.toJSON()});
		},
		html: function() {
			return VaSH.Mustache.to_html(this.tpl, {post: this.toJSON()});
		},
		toJSON: function() {
			return _.extend({}, this.attributes, {
				desc: this.getDesc(),
				teaser: this.getTeaser(),
				permalink: this.getLink(),
				tags: this.get('tags'),
				cat: this.getCategory()
			})
		}
	}); 

	exports.shared.route = '/post/:name' ;

})(typeof global === "undefined" ? window : exports) ;