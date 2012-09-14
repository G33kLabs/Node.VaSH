(function(exports, isNode) {

	// -- Declare widget
	var widgetId = 'aboutme' ;
	var widget = Backbone.Model.extend({

		// -- Basic configuration
		id: widgetId,
		title: 'About me',

		// ------------------------------------------- SERVER METHODS -------------
		// -> On page render
		onServerRender: function() {
			var json = {
				site: this.toJSON()
			}
			json.site.author.social = _.values(json.site.author.social); 
			return VaSH.Mustache.to_html(this.get('templates')['widget.'+this.id+'.html'], {site: this.attributes});
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