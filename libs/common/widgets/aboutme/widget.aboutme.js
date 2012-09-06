(function(exports, isNode) {

	exports.widget = Backbone.Model.extend({

		// -- Basic configuration
		id: 'aboutme',
		title: 'About me',

		// -- Link to html template
		tpl: true,

		// ------------------------------------------- SERVER METHODS -------------
		// -> On page render
		onRenderLayout: function(view, request) {
			tools.warning('widget::'+this.id+'::onRenderLayout') ;
		}

	}) ;

})(typeof global === "undefined" ? window : exports, typeof global !== "undefined" ) ;