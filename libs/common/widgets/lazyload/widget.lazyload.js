(function(exports, isNode) {

	var widgetId = 'lazyload' ;
	var widget = Backbone.Model.extend({

		// -- Basic configuration (id and title are required)
		id: widgetId,
		title: 'Images lazyload',
		daemon: true,

		// ------------------------------------------- CLIENT METHODS -------------
		refresh: function() {
			var els = $('[data-background]:not(.lazyloaded)') ;
			console.log('--> REFRESH', _.clone(els))
			if ( ! els.length ) return false;
			$('[data-background]:not(.lazyloaded)').lazyload({
				effect : "fadeIn"
			}).one('appear', function() {
				$(this).removeAttr('data-background').addClass('lazyloaded') ;
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