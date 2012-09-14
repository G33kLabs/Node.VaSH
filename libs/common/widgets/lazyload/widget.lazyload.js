(function(exports, isNode) {

	var widgetId = 'lazyload' ;
	var widget = Backbone.Model.extend({

		// -- Basic configuration (id and title are required)
		id: widgetId,
		title: 'Images lazyload',
		daemon: true,

		// ------------------------------------------- CLIENT METHODS -------------
		killLazyLoad: function() {

			// -> Detect mobile devices or if lazyload is not loaded
			if( ! _.isFunction($.fn.lazyload) || tools.isMobile.any() ) {

				// -> Replace inline images
				$('img[original]').each(function() {
					var el = ($this) ;
					el.attr("src", el.attr("original")).removeAttr('original');
				});					

				// -> Replace backgrounds
				$('[data-background]').each(function() {
					var el = $(this) ;
					el.css({"background-image": 'url('+el.data("background")+')'}).removeAttr('data-background');
				}) ;

			}

		},

		refresh: function() {

			// -> If lazyload js plugin not loaded
			if ( ! _.isFunction($.fn.lazyload) ) {
				this.killLazyLoad() ;
				return console.log('LazyLoad jQuery plugin is not installed... Skip...')
			}

			// -> Replace all background images
			$('[data-background]').not('.lazyloaded').addClass('lazyloaded').lazyload({
				effect : "fadeIn",
				skip_invisible : false
			}).on('appear', function() {
				$(this).off('appear') ;
				$(this).removeAttr('data-background')
			});
			
		},

		onClientRender: function() {
			this.refresh() ;
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