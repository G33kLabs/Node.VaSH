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
			//console.log('--> REFRESH', _.clone(els))
			if ( ! els.length ) return false;
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