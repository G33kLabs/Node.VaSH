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
					$.gaTracker.log('[>] Tracking GA : '+url);
					pageTracker._trackPageview(url);	
				} else {
					$.gaTracker.log('[>] Tracking GA : current page');
					pageTracker._trackPageview();		
				}
			} else {
				$.gaTracker.log('[>] Google Analytics Tracker is not ready') ;
			}
		},
		
		// Init GA
		init: function(code, url) {
			$.gaTracker.log('[>] Init Async GA');
			var self = this ;
			if ( typeof code != 'undefined' && this.code === false ) this.code = code ;
			if ( ! this.code ) $.gaTracker.log('[!] Google Analytics UA must be entered') ;
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
					$.gaTracker.log('[!] Failed to load Google Analytics:' + err);
				}
			}
		}
	};
})(jQuery);