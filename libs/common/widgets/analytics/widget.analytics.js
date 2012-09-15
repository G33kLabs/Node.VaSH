(function(exports, isNode) {

	var widgetId = 'analytics' ;
	var widget = Backbone.Model.extend({

		// -- Basic configuration (id and title are required)
		id: widgetId,
		title: 'Google Analytics',
		daemon: true,
		silent: true,

		// -- Defaults
		defaults: {
			code: null
		},

		// ------------------------------------------- CLIENT METHODS -------------
		// Track View
		track: function(url) {
			if ( 'undefined' == typeof _gat ) return false;
			if ( this.get('code') ) {
				try { var pageTracker = _gat._getTracker(this.get('code')); } catch(e) { var pageTracker = {}; } ;
				if ( typeof url != 'undefined' ) {
					if ( url.indexOf('http://') == 0 ) 
						url = '/'+url.replace('http://', '').split('/').slice(1).join('/') ;
					console.log('[>] Tracking GA : '+url);
					pageTracker._trackPageview(url);	
				} else {
					console.log('[>] Tracking GA : current page');
					pageTracker._trackPageview();		
				}
			} else {
				console.log('[>] Google Analytics Tracker is not ready') ;
			}
		},
		
		// Install GA script
		installScripts: function(code, url) {
			var self = this ;
			console.log('[>] Init Async GA');
			if ( typeof code != 'undefined' && this.get('code') === null ) this.set('code', code) ;
			if ( ! this.get('code') ) console.log('[!] Google Analytics UA must be entered') ;
			else {
				try{
					// determine whether to include the normal or SSL version
					var gaURL = (location.href.indexOf('https') == 0 ? 'https://ssl' : 'http://www');
					gaURL += '.google-analytics.com/ga.js';
			
					// include the script
					$.getScript(gaURL, function(){
						self.track(url) ;
					});

				} catch(err) {
					console.log('[!] Failed to load Google Analytics:' + err);
				}
			}
		},

		// -> Executed on client render
		onClientRender: function() {
			var code = $('#ga_code').data('google-analytics') ;
			this.installScripts(code) ;
		},

		// ------------------------------------------- SERVER METHODS -------------
		// -> On page render
		onServerRender: function() {
			return "<div id='ga_code' data-google-analytics='"+this.get('code')+"'></div>" ;
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