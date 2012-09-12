(function() {
	$(document).ready(function() {

		// -> Init marked converter
		marked.setOptions({
			gfm: true,
			pedantic: false,
			sanitize: true,
			// callback for code highlighter
			highlight: function(code, lang) {
				return code;
			}
		});

		// -> Start Admin Interface
		var AdminUI = new (Backbone.Model.extend({
			loadContent: function(url, part) {
				var self = this, startLoading = (new Date()).getTime() ;

				// -> Add loading layout
				$('#admin-panel').append('<div class="overlay overlay-white"></div>') ;
				setTimeout(function() { $('#admin-panel .overlay').css({'opacity':1}) }, 50);

				// -> Get html code
				$.get(url, function(data) {
					setTimeout(function() {
						$('#admin-panel').html($(data).find(part)) ;
						setTimeout(function() {
							self.initEditPanel() ;
						}, 200) ;
					}, Math.max(0, 600-((new Date()).getTime()-startLoading) )) ;
				}) ;
			},
			initEditPanel: function() {
				$('.admin-articles-edit textarea').tabby().trigger('keyup') ;
				
				//"http://shell.loopj.com/tokeninput/tvshows.php"
				var prePopulateTags = ($('.admin-articles-edit input#input-tags').val()||'').split(',') ;

				$('.admin-articles-edit input#input-tags').tokenInput("/admin/articles/tags/", {
	                theme: "mac",
	                prePopulate: _.map(prePopulateTags, function(tag) {
	                	return {
	                		id: tag,
	                		name: tag
	                	}
	                }) 
	            });
			}
		}))() ;

		// -> Bind textarea edit
		var textarea_delay = null; 
		$('.admin-articles-edit textarea').off('keyup').live('keyup', function(e) {
			var el = $(this) ;
			if ( textarea_delay ) clearTimeout(textarea_delay) ;
			textarea_delay = setTimeout(function() {
				$('#input-preview').html(marked(el.val()));
				$('#input-preview .oembed').oembed();
				$('#input-preview pre code').each(function(i, e) {hljs.highlightBlock(e)});
			}, 200) ;
		}) ;

		// -> Click on link
		$('a[href*="#admin-"]').live('click', function(e) {

			var el = $(this),
				href = $.trim(el.attr('href')),
				url = null,
				part = null  ;

			console.log('Admin Hash Tag Click !! ', href)

			if ( href == '#admin-articles-edit' ) {
				url = '/admin/articles/edit/?id='+(el.closest('[data-id]').data('id')) ;
				part = '.admin-articles-edit' ;
				AdminUI.loadContent(url, part) ;
			}
			else if ( href == '#admin-articles' ) {
				AdminUI.loadContent('/admin/articles/', '.admin-articles') ;
			}
			else if ( href == '#admin-dashboard' ) {
				AdminUI.loadContent('/admin/dashboard/', '.admin-dashboard') ;
			}
			else if ( href == '#admin-settings' ) {
				AdminUI.loadContent('/admin/settings/', '.admin-settings') ;
			}

			//e.stopPropagation(); 
			//e.preventDefault() ;

		}) ;

		// -> Load first page
		if ( /^\/admin\/$/.test(window.location.pathname) ) {
			$('a[href="#admin-articles"]').click() ;
		}

	}) ;
})() ;