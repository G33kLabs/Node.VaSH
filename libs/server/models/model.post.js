(function(exports) {

	var util = require('util') ;

	/////////////////////////////////////////////////////////////////////////
	// VaSH :: POST CLASS
	/////////////////////////////////////////////////////////////////////////

	exports.shared = Backbone.Model.extend({
		initialize: function(opts, instance) {
			this.siteObj = instance; 
			this.tpl = instance.templates['post.html'] 
			this.tpl_teaser = instance.templates['teaser.html'] 
			return this;
		},
		getTitle: function() {
			return this.get('title')
		},
		getTeaser: function(max) {
			max = max || 200 ;
			var txt = tools.teaser(this.get('content'), max).replace(/(<([^>]+)>)/ig," ");
			return VaSH.minifyHTML(tools.trim(txt)+(txt.length>max?' <small>[...]</small>':''));
		},
		getRSSTeaser: function(max) {
			max = max || 200 ;
			var txt = tools.teaser(this.get('content'), max).replace(/(<([^>]+)>)/ig," ").replace(new RegExp("\n", 'g'), '');
			return VaSH.minifyHTML(tools.trim(txt)+(txt.length>max?' [...]':''));
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
			return this.siteObj.get('website')+this.getCategory().toLowerCase()+'/'+tools.permalink(this.get('title'))
		},
		getAuthor: function() {
			return this.siteObj.get('authors')[this.get('author')] 
		},
		teaser: function() {
			return VaSH.minifyHTML(VaSH.Mustache.to_html(this.tpl_teaser, {post: this.toJSON()}));
		},
		html: function() {
			return VaSH.minifyHTML(VaSH.Mustache.to_html(this.tpl, {post: this.toJSON()}));
		},
		toJSON: function() {
			return _.extend({}, this.attributes, {
				desc: this.getDesc(),
				teaser: this.getTeaser(),
				permalink: this.getLink(),
				tags: this.get('tags'),
				cat: this.getCategory()
			})
		},
		toRSS: function() {
			return {
				title: this.getTitle(),
				teaser: this.getRSSTeaser(),
				content: this.html(),
				permalink: this.getLink(),
				tags: this.get('tags'),
				cat: this.getCategory(),
				author: this.getAuthor(),
				comments: 0,
				pubDate: tools.GetRFC822Date(new Date(this.get('created')))
			}
		}
	}); 

	exports.shared.route = '/post/:name' ;

})(typeof global === "undefined" ? window : exports) ;