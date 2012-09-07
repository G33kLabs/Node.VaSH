(function(exports, isNode) {

	var widgetId = 'github' ;
	var widget = Backbone.Model.extend({

		// -- Basic configuration
		id: widgetId,
		title: 'GitHub',

		// -- Blogs:
		defaults: {

		},

		// ------------------------------------------- CLIENT METHODS -------------
		onClientRender: function() {

			require(['/common/js/github.js'], function() {
				var repo = github.getRepo('G33kLabs', 'Node.VaSH');
				repo.show(function(err, repo) {
					console.log(err, repo)
				});
			})

		},

		// ------------------------------------------- SERVER METHODS -------------
		// -> On page render
		onServerRender: function() {
			return 'GitHub'
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