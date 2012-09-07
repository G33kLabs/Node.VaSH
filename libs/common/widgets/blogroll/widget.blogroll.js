(function(exports, isNode) {

	var widgetId = 'blogroll' ;
	var widget = Backbone.Model.extend({

		// -- Basic configuration
		id: widgetId,
		title: 'Blog Roll',

		// -- Blogs:
		defaults: {
			urls: [
				{
					name: 'Web2ajaX',
					url: 'http://www.web2ajax.fr/',
					title: 'Visit my official Blog !'
				},
				{
					name: 'Korben.info',
					url: 'http://www.korben.info/',
					title: 'Visit Korben website !'
				},
				{
					name: 'DailyJS : Fresh news !',
					url: 'http://www.dailyjs.com/',
					title: 'Good and fresh news from js community !'
				},
				{
					name: 'Paul Irish',
					url: 'http://paulirish.com/',
					title: 'A really interesting man, Developper at Google !'
				},				
				{
					name: 'My Online CV',
					url: 'http://www.delarueguillaume.com/',
					title: 'Visit my Online CV !'
				}
			]
		},

		// ------------------------------------------- CLIENT METHODS -------------
		onClientRender: function() {

			// -> Preload pictures
			var widgets = $('.widget-'+this.id).find('.preview') ;
			async.forEachSeries(widgets, function(widget, callback) {
				var el = $(widget) ;
				$('<img />')
				    .attr('src', el.data('background'))
				    .load(function(){
				    	el.css({backgroundImage: 'url('+el.data('background')+')', opacity: 1})
				    	setTimeout(function() {
				    		callback() ;
				    	}, 300)
				    })
				    .error(function() {
				    	el.css({opacity: 1})
				    	callback() ;
				    });
			}, function() {
				console.log('Complete') ;
			}) ;

		},

		// ------------------------------------------- SERVER METHODS -------------
		// -> On page render
		onServerRender: function() {
			_.each(this.get('urls'), function(blog) {
				blog.urlText = blog.url.replace(/(http:|https:|\/)/g, '') ;
			})
			return VaSH.Mustache.to_html(this.get('templates')['widget.'+this.id+'.html'], {
				site: this.attributes,
				urls: this.get('urls')
			});
		}

	}) ;

	////////////////////////////////////////////////////////// DO NOT EDIT
	// -- Export to class 
	if ( isNode ) {
		exports.widget = widget
	}
	else {
		exports.widgets = exports.widgets || {} ;
		exports.widgets[widgetId] = widget; 
	}

})(typeof global === "undefined" ? window : exports, typeof global !== "undefined" ) ;