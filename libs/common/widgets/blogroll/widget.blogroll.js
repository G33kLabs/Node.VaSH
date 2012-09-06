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
					name: 'My CV',
					url: 'http://www.delarueguillaume.com/',
					title: 'Visit my Online CV !'
				}
			]
		},

		// ------------------------------------------- SERVER METHODS -------------
		// -> On page render
		onServerRender: function() {
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