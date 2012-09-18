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
		getRSSTeaser: function(max, dots) {
			max = max || 200 ;
			dots = dots ||  ' [...]' ;
			var txt = tools.teaser(this.get('content'), max).replace(/(<([^>]+)>)/ig," ").replace(new RegExp("\n", 'g'), '');
			return VaSH.minifyHTML(tools.trim(txt)+(txt.length>max?dots:''));
		},
		getCategory: function() {
			var mainTag ;
			if ( _.isArray(this.get('tags')) ) {
				mainTag = _.first(this.get('tags')) ;
			}
			return mainTag || 'General' ;
		},
		getDesc: function() {
			return this.get('desc')
		},
		getLink: function() {
			return this.siteObj.getBaseUrl()+'/'+tools.permalink(this.getCategory())+'/'+tools.permalink(this.get('title')||'')
		},
		getShortLink: function() {
			return this.siteObj.getBaseUrl()+'/'+tools.permalink(this.getCategory())+'/'+tools.permalink(this.get('title')||'')
		},
		getThumbnail: function() {
			return this.get('thumb') ? this.siteObj.getBaseUrl()+'/thumb/'+this.get('id')+'_thumb.jpg' : null;
		},
		getAuthor: function() {
			return this.siteObj.get('authors')[this.get('author')] 
		},
		teaser: function() {
			return VaSH.minifyHTML(VaSH.Mustache.to_html(this.tpl_teaser||'', {post: this.toJSON()}));
		},
		html: function(feed) {
			var opts = {
				feed: feed,
				site: this.siteObj.toJSON(),
				post: this.toJSON()
			}; 
			if ( this.siteObj ) {
				opts.baseUrl = this.siteObj.getBaseUrl() ;
			}
			if ( this.get('isAdmin') && ! feed ) {
				opts.showAdminEdit = true ;
			}
			if ( opts.post.thumb ) {
				if ( opts.feed ) opts.showFeedThumbnail = true ;
				else opts.showNormalThumbnail = true ;
			}
			return VaSH.minifyHTML(VaSH.Mustache.to_html(this.tpl||'', opts));
		},
		getModel: function() {
			return 'id created title desc raw content tags thumb author disabled'.split(' ');
		},
		toJSON: function() {
			return _.extend({}, this.attributes, {
				desc: this.getDesc(),
				teaser: this.getTeaser(),
				permalink: this.getLink(),
				shortlink: this.getShortLink(),
				tags: _.map(this.get('tags'), function(tag) {
					return {
						name: tag,
						url: '/'+tools.permalink(tag)+'/'
					}
				}),
				big_thumb: this.getThumbnail(),
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
				content: this.html(true),
				permalink: this.getLink(),
				shortlink: this.getShortLink(),
				tags: _.map(this.get('tags'), function(tag) {
					return {
						name: tag,
						url: '/'+tools.permalink(tag)+'/'
					}
				}),
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