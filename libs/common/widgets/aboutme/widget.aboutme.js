(function(exports, isNode) {

	exports.widget = Backbone.Model.extend({

		// -- Basic configuration
		id: 'aboutme',
		title: 'About me',

		// ------------------------------------------- SERVER METHODS -------------
		// -> On page render
		onServerRender: function() {
			return VaSH.Mustache.to_html(this.get('templates')['widget.'+this.id+'.html'], {site: this.attributes});
		}

	}) ;

})(typeof global === "undefined" ? window : exports, typeof global !== "undefined" ) ;