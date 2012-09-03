(function() {

	$(document).ready(function() {

		// -> Application UI Helpers
		var ApplicationUI = Backbone.Model.extend({
			initialize: function() {
				this.dom = {
					nav: $('#navbar')
				}
				this.bindNav() ;
				this.liveReload() ;
				this.initSocketIO() ;
				this.headerAnime() ;
				//this.info('success', 'Welcome to '+this.dom.nav.find('a.brand').text()+' !') ;
				return this; 
			},
			parse_url: function(url) {
			    var a = document.createElement('a');
			    a.href = url;
			    return a;
			},
			info: function(type, message, manualClose) {
			    $("#alert-area").append($("<div class='alert alert-" + type + " fade in' data-alert><button type='button' class='close' data-dismiss='alert'>×</button><p> " + message + " </p></div>"));
			    if ( ! manualClose ) $(".alert").delay(4000).fadeOut("slow", function () { $(this).remove(); });
			},
			getCurrentTab: function() {
				self.currentTab = $.trim(this.dom.nav.find('ul.nav li.active').text()).toLowerCase() ;
				return self.currentTab;
			},
			bindNav: function() {
				var self = this, navLinks ;
				navLinks = this.dom.nav.find('ul.nav li'); 

				// -> Bind clicks
				navLinks.live('click', function(e) {
					$(this).addClass('active').siblings().removeClass('active')
					self.getCurrentTab() ;
				}) ;

				// -> If no active tab at page loading
				if ( ! navLinks.filter('.active').length ) {
					var path = (self.parse_url(window.location.href).pathname).match(/^\/([a-zA-Z0-9.\-]+)\//) ;
					var activeEl = navLinks.first() ;
					if ( path ) {
						var searchEl = navLinks.filter(function() {
							return new RegExp("^"+$.trim(path[1]), 'i').test( $(this).text() );
						});
						if ( searchEl.length ) activeEl = searchEl ;
					}
					activeEl.addClass('active')
				}
			},
			liveReload: function() {
				setTimeout(function() {
					$('<script src="https://github.com/livereload/livereload-js/raw/master/dist/livereload.js?host=localhost"></script>').appendTo('body')
				}, 1000)
			},
			initSocketIO: function() {
				require(["/socket.io/socket.io.js"], function() {
					var socket = io.connect();
					socket.on('news', function (data) {
						console.log(data);
					});					
				})
			},
			headerAnime: function() {
				var inner = $('header .inner'), pos, seq = [[50, 40], [50, 50], [50, 60],[60, 30],[60, 40], [60, 50], [60, 60],[50, 30]] ;
				self.headerAnimeLoop = setInterval(function() {
					seq.push(pos=seq.shift()) ;
					inner.css({
						backgroundPosition: pos[0]+'px '+pos[1]+'px'
					})
				}, 1000) ;
			}
		})


		// -> Init application UI
		console.log('[>] Document is ready !')
		var app = new ApplicationUI() ;

	}); 

}).apply(this) ;