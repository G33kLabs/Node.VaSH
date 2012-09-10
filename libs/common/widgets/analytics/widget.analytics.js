(function(exports, isNode) {

/*
(function($){
	$.gaTracker = {

		// To store the Google Analytics Code
		code: false,
		
		// Log function
		log: function(txt) {
			try {
				console.log(txt) ;
			} catch(e) {} ;
		},
		
		// Track View
		track: function(url) {
			if ( 'undefined' == typeof _gat ) return false;
			var self = this ;
			if ( self.code ) {
				try { var pageTracker = _gat._getTracker(self.code); } catch(e) { var pageTracker = {}; } ;
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
		
		// Init GA
		init: function(code, url) {
			console.log('[>] Init Async GA');
			var self = this ;
			if ( typeof code != 'undefined' && this.code === false ) this.code = code ;
			if ( ! this.code ) console.log('[!] Google Analytics UA must be entered') ;
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
					// log any failure
					console.log('[!] Failed to load Google Analytics:' + err);
				}
			}
		}
	};
})(jQuery);


		// -> Init GA Tracking
		if ( _.isObject($.gaTracker) && _.isFunction($.gaTracker.init) ) {
			var gaCode = $('#js-env').data('googleanalytics') ;
			if ( gaCode ) $.gaTracker.init(gaCode) ;
		}
*/

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

		onClientRender: function() {

			// -> Get code
			var code = $('#ga_code').data('google-analytics') ;

			// -> Install scripts and track current page
			this.installScripts(code) ;

		},

		// ------------------------------------------- SERVER METHODS -------------
		// -> On page render
		onServerRender: function() {
			return "<div id='ga_code' data-google-analytics='"+this.get('googleAnalytics')+"'></div>" ;
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