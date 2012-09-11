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
				var startLoading = (new Date()).getTime() ;

				// -> Add loading layout
				$('#admin-panel').append('<div class="overlay overlay-white"></div>') ;
				setTimeout(function() { $('#admin-panel .overlay').css({'opacity':1}) }, 50);

				// -> Get html code
				$.get(url, function(data) {
					setTimeout(function() {
						$('#admin-panel').html($(data).find(part)) ;
						setTimeout(function() {
							$('.admin-articles-edit textarea').tabby().trigger('keyup') ;
						}, 200) ;
					}, Math.max(0, 600-((new Date()).getTime()-startLoading) )) ;
				}) ;
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

			//e.stopPropagation(); 
			//e.preventDefault() ;

		}) ;

		// -> Load first page
		console.log('href:', window.location.pathname)
		if ( /^\/admin\/$/.test(window.location.pathname) ) {
			$('a[href="#admin-articles"]').click() ;
		}

	}) ;
})() ;