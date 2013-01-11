// -- Set timers
$timers = {} ;

// -- Facebook jQuery plugin
(function( $ ){
	
	// Default settings
	var settings = {
		'trigger_prefix'	: 'twitter_'
	};
	
	var env = { 
		status: 'notConnected',
		isFan: false,
		isLogged: false,
		location: {},
		session: {}
	} ;
	
	// Methods
	var methods = {
	
		// -- Init Facbook jQuery plugin
		init : function( options ) {

			if ( options ) 
				$.extend( settings, options );					
			
			// Get locale 
			settings.locale = methods.getLocale() ;
			
			// Install Facebook JS API
			settings.api_url = '//platform.twitter.com/widgets.js' ; 
			methods.installJS() ;
			
			// Try to Geolocate client
			if ( settings.locate ) {
				if ( typeof $.fn.geolocation == 'function' ) {
					try {
						settings.locate.onSuccess = function(location) {
							methods.triggerAction('onGeolocate', location) ;
						} ;
						settings.locate.onFail = function(error) {
							methods.triggerAction('onGeolocateFail', error) ;
						} ;
						$.geolocation(settings.locate) ;
					} catch(e) {
						$.facebook.log(e) ;
					}
				}
			}
			 
			// Return object
			return this ;
			
		},
		
		// Return settings to api
		getOpt: function(optName) {
			return settings[optName] ;
		},
		
		// Trigger an action
		triggerAction: function(action, message) {
			$.twitter.log(action+' => '+JSON.stringify(message)) ;
			
			if ( settings.trigger_prefix ) $(document).trigger( settings.trigger_prefix + action, message) ;	
		},
		
		// Return env variable
		getEnv: function() {
			return env;
		},
		
		// Init the api
		initAPI: function() {
			

			
		},
		
		// Install Facebook JS API and bind his load
		installJS: function() {
			
			var match = false;
			var _s = this ;
			$.each($('script') , function(key, val)	{
				if ( typeof $(val).attr('src') != 'undefined' ) 
					if ( $(val).attr('src').match(settings.api_url) ) match = true ;
			}) ;
			if ( match ) {
				$.twitter.log('|-> twitter loader is already Loaded...') ;
				_s.onComplete() ;
			} else {
				$.twitter.log('|-> Install twitter loader JS API...') ;
				(function() {
					$.twitter.log('|-> Load API File...') ;
					var e = document.createElement('script');
					e.type = 'text/javascript';
					e.src = settings.api_url;
					e.async = true;
					var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(e, s);
				}());
			}
		
		},

		// -- Get locale
		getLocale: function() {
		
			// -- Current language
			var locale = '' ;
			if ( settings.locale ) {
				locale = settings.locale
			} else if ( navigator ) {
			    if ( navigator.language ) {
			        locale = navigator.language;
			    }
			    else if ( navigator.browserLanguage ) {
			        locale = navigator.browserLanguage;
			    }
			    else if ( navigator.systemLanguage ) {
			        locale = navigator.systemLanguage;
			    }
			    else if ( navigator.userLanguage ) {
			        locale = navigator.userLanguage;
			    }
			}
			
			// -- All facebook supported languages
			// -> https://api.facebook.com/method/intl.getTranslations?locale=all&access_token=xxx&format=json
			this._locales = ["ca_ES","cs_CZ","cy_GB","da_DK","de_DE","eu_ES","en_PI","en_UD","en_US","es_LA","es_ES","fi_FI","fr_FR","gl_ES","hu_HU","it_IT","ja_JP","ko_KR","nb_NO","nn_NO","nl_NL","fy_NL","pl_PL","pt_BR","pt_PT","ro_RO","ru_RU","sk_SK","sl_SI","sv_SE","th_TH","tr_TR","ku_TR","zh_CN","zh_HK","zh_TW","fb_LT","af_ZA","sq_AL","hy_AM","az_AZ","be_BY","bn_IN","bs_BA","bg_BG","hr_HR","en_GB","eo_EO","et_EE","fo_FO","fr_CA","ka_GE","el_GR","hi_IN","is_IS","id_ID","ga_IE","la_VA","lv_LV","lt_LT","mk_MK","ms_MY","ne_NP","pa_IN","sr_RS","sw_KE","tl_PH","ta_IN","te_IN","ml_IN","uk_UA","vi_VN","ar_AR","he_IL","fa_IR","ps_AF"] ;
			
			// -- Fix variants and set country
			var finded = false ;
			$.each(this._locales, function(key, val) {
				if ( ((val || '').toLowerCase()).indexOf(locale) != -1 ) {
					finded = true ;
					locale = val ;
				}	
			}) ;
			
			// -- Set default if not finded
			if ( ! finded ) {
				locale = 'en_US';
			}
			
			return locale ;
		
		},

		show : function( ) { 
			$.facebook.log(settings) ;
		}
	};
	
	// PLugin Call
	$.fn.twitter = function( method ) {
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.twitter' );
		}    
	};
	
	$.twitter = $(document).twitter ;
	
	// Log function
	$.twitter.log = function(txt) {
    	try {
    		console.log('twitter API: '+JSON.stringify(txt));
	    } catch(e) { }
	} ;


})( jQuery );
