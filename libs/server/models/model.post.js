(function(exports) {

	var util = require('util') ;

	/////////////////////////////////////////////////////////////////////////
	// VaSH :: POST CLASS
	/////////////////////////////////////////////////////////////////////////

	exports.shared = Backbone.Model.extend({
		initialize: function(opts, instance) {
			if ( ! instance ) return this ;
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
			return '/'+tools.permalink(this.getCategory()||'general')+'/'+tools.permalink(this.get('title')||'')
		},
		getAuthor: function() {
			return this.siteObj.get('authors')[this.get('author')] 
		},
		teaser: function() {
			return VaSH.minifyHTML(VaSH.Mustache.to_html(this.tpl_teaser||'', {post: this.toJSON()}));
		},
		html: function() {
			return VaSH.minifyHTML(VaSH.Mustache.to_html(this.tpl||'', {post: this.toJSON()}));
		},
		getModel: function() {
			return 'id created title desc raw content tags thumb author disabled'.split(' ');
		},
		toJSON: function() {
			return _.extend({}, this.attributes, {
				desc: this.getDesc(),
				teaser: this.getTeaser(),
				permalink: this.getLink(),
				tags: _.map(this.get('tags'), function(tag) {
					return {
						name: tag,
						url: '/'+tools.permalink(tag)+'/'
					}
				}),
				big_thumb: this.get('thumb') ? '/'+this.get('id')+'/thumb' : null,
				author: this.getAuthor(),
				author_email: this.get('author'),
				disabled: (this.get('disabled') == 'yes') ? 'yes' : 'no',
				isDisabled: (this.get('disabled') == 'yes') ? true : false,
				comments: 0,
				createdDate: new Date(this.get('created')).toString("dd MMM yyyy HH:mm"),
				updatedDate: this.get('updated') ? new Date(this.get('updated')).toString("dd MMM yyyy HH:mm") : null,
				cat: this.getCategory()
			})
		},
		toRSS: function() {
			return {
				title: this.getTitle(),
				teaser: this.getRSSTeaser(),
				content: this.html(),
				permalink: this.siteObj.getBaseUrl()+this.getLink(),
				tags: this.get('tags'),
				cat: this.getCategory(),
				author: this.getAuthor(),
				disabled: this.get('disabled') == 'yes' ? 'yes' : 'no',
				isDisabled: this.get('disabled') == 'yes' ? true : false,
				comments: 0,
				pubDate: tools.GetRFC822Date(new Date(this.get('created')))
			}
		}
	}); 

	exports.shared.route = '/post/:name' ;

})(typeof global === "undefined" ? window : exports) ;