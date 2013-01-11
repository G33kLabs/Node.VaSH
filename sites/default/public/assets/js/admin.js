(function() {
	$(document).ready(function() {

		// -> Init marked converter
		marked.setOptions({
			gfm: true,
			pedantic: false,
			sanitize: false,
			// callback for code highlighter
			highlight: function(code, lang) {
				return code;
			}
		});

		// -> Start Admin Interface
		var AdminUI = new (Backbone.Model.extend({

			// -> Load
			load: function() {

				// -> Bind hash changes
				window.onhashchange = function(e) {
					AdminUI.onHashChange(e) ;
				};

				// -> There is an hastag in location
				if ( tools.getLocationHash() ) {
					this.onHashChange() ;
				}

				// -> Load first page
				else if ( /^\/admin\/$/.test(window.location.pathname) ) {
					$('a[href="#admin-articles"]').click() ;
					window.location.hash = "admin-articles"
					//this.loadContent('/admin/articles/edit/37610026907c57ca3d59c66d15aa3de9', '.admin-articles-edit')
				}
				else {
					this.onload() ;
				}
			},

			// -> On hash change
			onHashChange: function(e) {
				var hash = tools.getLocationHash() ;
				var self = this ;
				if ( hash ) {
					
					//console.log(url, part)

					// -> Some logs
					console.log('Hash changed => '+hash); 

					// -> Special cases
					var match = null ;
					if ( match = hash.match(/^admin-noop/) ) {
						return;
					}
					if ( match = hash.match(/^admin-articles-open-(.*)/) ) {
						$('#input-disabled').data('value', 'no') ;
						return self.submit();
					}
					else if ( match = hash.match(/^admin-articles-close-(.*)/) ) {
						$('#input-disabled').data('value', 'yes') ;
						return self.submit();
					}
					else if ( match = hash.match(/^admin-articles-create-(.*)/) ) {
						console.log('Ask to create a post')
						//$('#input-disabled').data('value', 'yes') ;
						//return self.submit();
					}
					else if ( match = hash.match(/^admin-articles-delete-(.*)-confirm/) ) {
						console.log('Ask to delete a post :: '+match[1]) ;
						$('#delete-modal').modal('hide') ;
						return self.submit({
							id: match[1],
							delete: true
						});
					}
					else if ( match = hash.match(/^admin-articles-delete-(.*)/) ) {
						$('#delete-modal a#confirm-delete').attr('href', '#admin-articles-delete-'+match[1]+'-confirm')
						$('#delete-modal').modal() ;
						return;
					}

					// -> Get url to load
					var url = '/'+hash.replace(/-/g, '/') ;
					var part = '.'+hash.split('-').slice(0, 3).join('-') ;
					console.log('Hash changed => '+hash+ ' | Url => '+url + ' | Part => '+part); 
					this.loadContent(url, part) ; 

					// -> Highlight the good menu
					var menu = hash.split('-').slice(0, 2).join('-') ;
					$('#navbar a[href="#'+menu+'"]').parent().addClass('active').siblings().removeClass('active') ;
					
				}
			},

			// -> Show an overlay
			overlay: function(enable) {
				if ( enable ) {
					$('#admin-panel').append('<div class="overlay overlay-white"></div>') ;
					setTimeout(function() { $('#admin-panel .overlay').css({'opacity':1}) }, 50);
				}
				else {
					setTimeout(function() { $('#admin-panel .overlay').css({'opacity':0}) }, 50);
					setTimeout(function() { $('#admin-panel .overlay').remove() }, 500);
				}
			},

			// -> Load content with AjaX
			loadContent: function(url, part) {
				var self = this, startLoading = (new Date()).getTime() ;

				// -> Add loading layout
				self.overlay(true) ;

				// -> Get html code
				$.ajax({
					url: url,
					dataType: 'text'
				}).success(function(data) {
					var fullPage = $(data) ;
					$('#overview h1').html(fullPage.find('h1')) ;
					$('#overview .lead').html(fullPage.find('p.lead')) ;
					$('#admin-panel').html(fullPage.find(part)) ;
				}).error(function(err) {
					console.log(err)
				}).done(function() {
					setTimeout(function() {
						setTimeout(function() {
							self.overlay() ;
							self.onload() ;
						}, 200) ;
					}, Math.max(0, 600-((new Date()).getTime()-startLoading) )) 
				})
/*
				$.get(url, function(data) {
					setTimeout(function() {
						var fullPage = $(data) ;
						$('#overview h1').html(fullPage.find('h1')) ;
						$('#overview .lead').html(fullPage.find('p.lead')) ;
						$('#admin-panel').html(fullPage.find(part)) ;
						setTimeout(function() {
							self.onload() ;
						}, 200) ;
					}, Math.max(0, 600-((new Date()).getTime()-startLoading) )) ;
				}) ;
*/				
			},

			// -> On page loaded
			onload: function() {

				// -> Display start page
				this.initEditPanel() ;

			},

			// -> Init Eit Panel
			initEditPanel: function() {
				var self = this,
					textarea = $('.admin-articles-edit textarea'),
					preview = $('#input-preview') ;

				// -> Bind datepicker
				$('#input-created').datetimepicker({
					dateFormat: "dd M yy"
				}).datepicker( "setDate" , new Date($('#input-created').data('created')) )

				// -> Support autocomplete tags
				var prePopulateTags = $('.admin-articles-edit input#input-tags').val() ? ($('.admin-articles-edit input#input-tags').val()||'').split(',') : [] ;
				if ( ! $('.admin-articles-edit .token-input-list-mac').length ) { 
					$('.admin-articles-edit input#input-tags').tokenInput("/admin/articles/tags/", {
		                theme: "mac",
		                prePopulate: prePopulateTags.length?(_.map(prePopulateTags, function(tag) {
		                	return {
		                		id: tag,
		                		name: tag
		                	}
		                })) : null
		            });
				}

				// -> Bind textarea edit
				var textarea_delay = null; 
				textarea.off('keyup').live('keyup', function(e) {
					var el = $(this) ;
					if ( textarea_delay ) clearTimeout(textarea_delay) ;
					textarea_delay = setTimeout(function() {
						preview.html(marked(el.val()));
						preview.find('.oembed').oembed();
						preview.find('pre code').each(function(i, e) {hljs.highlightBlock(e)});
					}, 200) ;
				}) ;	

				// -> Support tab in textarea
				textarea.tabby().trigger('keyup') ;  

				// -> Bind uploader
				var holder = $('body').off('dragover dragend drop') ;
				var container = $('#input-thumbnail') ;
				var support = {
      				filereader: typeof FileReader != 'undefined',
			      	dnd: 'draggable' in document.createElement('span'),
			      	formdata: !!window.FormData,
			      	progress: "upload" in new XMLHttpRequest
			    }  
				holder.live('dragover', function () { 
					console.log('dragover')
					container.addClass('dragover'); 
					return false; 
				});
				holder.live('dragend', function () { 
					console.log('dragend')
					container.removeClass('dragover'); 
					return false; 
				});
				holder.live('drop', function (e) { 
					console.log('drop', e)
					container.removeClass('dragover'); 
					container.addClass('uploading'); 
					e.preventDefault();
					var files = e.originalEvent.dataTransfer.files ;
					self.uploadFile(files) ;
				});

				// -> Submit
				$('.admin-articles-edit form').off('submit').on('submit', function(e) {
					self.submit() ;
					return false;
				}); 

				// -> Add submit bottom to bottom
				var actionButtons  = $('#action_buttons') ;
				if ( actionButtons.length == 1 && (/^admin-articles-edit-/.test(tools.getLocationHash()) || /^admin-articles-create-/.test(tools.getLocationHash())) ) {
					var actionButtons_clone = actionButtons.clone(true) ;
					actionButtons_clone.addClass('bottom') ;
					actionButtons_clone.appendTo(actionButtons.parent()) ;
				}

				// -> Follow scrolling on textarea
				var scrollArea = null ;
				textarea.on('scroll', function(e) {
					if ( scrollArea == 'preview' ) return false;
					scrollArea = 'textarea' ;
					var scrollHeight = textarea.get(0).scrollHeight ;
					var scrollTop = textarea.get(0).scrollTop ;
					var previewScrollHeight = preview.get(0).scrollHeight ;
					var previewScroll = previewScrollHeight * scrollTop / scrollHeight ;
					preview.get(0).scrollTop = previewScroll ;
					setTimeout(function() {scrollArea=null}, 200) ;
				})

				preview.on('scroll', function(e) {
					if ( scrollArea == 'textarea' ) return false;
					scrollArea = 'preview' ;
					var scrollHeight = preview.get(0).scrollHeight ;
					var scrollTop = preview.get(0).scrollTop ;
					var previewScrollHeight = textarea.get(0).scrollHeight ;
					var previewScroll = previewScrollHeight * scrollTop / scrollHeight ;
					textarea.get(0).scrollTop = previewScroll ;
					setTimeout(function() {scrollArea=null}, 200) ;
				})

			},

			// -> Submit updates
			submit: function(addons) {
				var self = this ;
				var postUrl = null ;
				var container = $('.admin-articles-edit'); 
				var submitButtons = container.find('[type="submit"]').parent().children('button').button() ;
				var submitedAt = $.now(); 
				var post = {
					id: container.data('id'),
					disabled: container.find('#input-disabled').data('value'),
					author: container.find('#input-author').data('value'),
					title: container.find('#input-title').val(),
					desc: container.find('#input-desc').val(),
					raw: container.find('#input-content').val(),
					tags: (container.find('#input-tags').val()||'').split(','),
					thumb: container.find('#input-thumb').attr('src')
				}

				// -> Get date
				if ( container.find('#input-created').length ) {
					post.created = (container.find('#input-created').datepicker( "getDate")).getTime() ;
				}
				post.created = post.created || (new Date().getTime()) ;

				// -> Extend post datas
				if ( addons ) _.extend(post, addons) ;

				// -> Some hack
				post.disabled = (post.disabled == 'yes') ? 'yes' : 'no';
				
				// -> Set button as disabled
				submitButtons.removeClass('btn-success btn-warning').button('loading'); 
				self.overlay(true) ;

				// -> Set post url
				if ( /^admin-articles-create/.test(tools.getLocationHash()) ) {
					postUrl = '/admin/articles/create/'+post.id ;
				}
				else {
					postUrl = '/admin/articles/edit/'+post.id;
				}

				// -> Post form
				async.waterfall([
					function(callback) {
						$.ajax({
							url: postUrl,
							dataType: 'json',
							data: post,
							cache: false,
							type: 'POST'
						}).success(function(datas) {
							var delay = Math.max(0, 1500 - ($.now() - submitedAt)); 
							var hash = 'admin-articles-edit-'+post.id ;
							console.log(datas, datas ? datas.success : null )
							callback(null, datas) ;
						}).error(function(err) {
							callback(err) ;
						})
					}
				], function(err, datas) {
					var delay = Math.max(0, 1500 - ($.now() - submitedAt)); 
					var hash = 'admin-articles-edit-'+post.id ;
					setTimeout(function() {

						if ( err || ! datas || datas.error ) {
							submitButtons.addClass('btn-warning').button('reset'); 
							err = err ? JSON.stringify(err) : datas ? JSON.stringify(datas.error) : 'No response from server...' ;
							window.app.info('alert', err)
							self.overlay();
						}
						else {
							if ( datas.success.delete_post ) {
								window.location.hash = 'admin-articles';
							}
							else if ( tools.getLocationHash() == hash ) {
								$('#admin-panel').html($(datas.export.page.content).find('.admin-articles-edit')) ;
								submitButtons.addClass(datas && datas.success?'btn-success':'btn-warning').button('reset'); 
								self.onload() ;
							}
							else {
								window.location.hash = hash;
							}
						}
						
					}, delay) ;

					console.log('POst request done')
				});

			},

			// -> Upload file
			uploadFile: function(files) {
				var self = this ;
				var container = $('#input-thumbnail') ;
				var extensions = 'gif jpeg jpg png'.split(' ') ;

				if(files.length > 0){

					var file = files[0],
						imgWidth = 650,
						imgHeight = 200 ;

					async.waterfall([

						// -> Read file
						function(callback) {
							var reader = new FileReader();
							reader.onload = function (event) {
								callback(null, event)
							}
							reader.readAsDataURL(file);
						},

						// -> Build preview image
						function(event, callback) {

							// -> Check extension
							if ( extensions.indexOf(tools.extension(file.name)) < 0 )
								return callback('Image must be '+extensions.join(', ')+'...') ;

							// -> Load into picture
							var image = $('<img/>').load(function() {

									// -> Check dimensions
									if ( this.width < imgWidth || this.height < imgHeight ) 
										return callback('Image must be at least '+imgWidth+'x'+imgHeight+', yours is '+this.width+'x'+this.height) ;
/*
									var canvas = document.createElement("canvas");
									  new tools.thumbnailer(canvas, this, 188, 3); //this produces lanczos3
									  //but feel free to raise it up to 8. Your client will appreciate
									  //that the program makes full use of his machine.
									  document.body.appendChild(canvas);
*/
									// -> Next
									callback(null, this) ;

								})
								.attr('src', event.target.result);	
						},

						// -> Load preview into preview canas
						function(image, callback) {

							//get selected effect
							var effect = $('input[name=effect]:checked').val();
							var croping = true;
						
							//define canvas
							var canvas = document.createElement('canvas');
							canvas.width = imgWidth;
							canvas.height = imgHeight;
							var ctx = canvas.getContext('2d');
							
							//default resize variable
							var diff = [0, 0];
							if(croping == 'crop') {
								//get resized width and height
								diff = compareWidthHeight(image.width, image.height);
							}

							var newDimensions = {} ;
							if ( image.width > imgWidth ) {
								newDimensions.height = image.height*imgWidth/image.width ;
								newDimensions.width = imgWidth ;
								diff[1] = Math.floor(image.height - newDimensions.height) ;
							}
							else {
								newDimensions.height = image.height ;
								newDimensions.width = image.width ;
							}
							
							//draw canvas image	
							ctx.translate(0, -diff[1])
							ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, newDimensions.width, newDimensions.height);

							//tx.drawImage(image, diff[0]/2, diff[1]/2, image.width-diff[0], image.height-diff[1], 0, 0, image.width, image.height);
										
							//apply effects if any					
							if(effect == 'grayscale') {
								grayscale(ctx);
							} else if(effect == 'blurry') {
								blurry(ctx, image, diff);
							} else {}
							
							//convert canvas to jpeg url
							callback(null, {
								width: image.width,
								height: image.height,
								src: canvas.toDataURL("image/jpeg")
							}) ;

						},
						function(image, callback) {	

							//populate jQuery Template binding object
							var imageObj = {};
							imageObj.filePath = image.src;
							imageObj.fileName = file.name.substr(0, file.name.lastIndexOf('.')); //subtract file extension
							imageObj.fileOriSize = tools.convertToKBytes(file.size);
							//imageObj.fileUploadSize = convertToKBytes(dataURItoBlob(newURL).size); //convert new image URL to blob to get file.size
							
							var html = '' ;
							html += "<img src='"+imageObj.filePath+"' id='input-thumb'>" ;
							html += '<hr /><div class="infos">';
							html += '<p>Filename : <span>'+imageObj.fileName + ' (' + imageObj.fileOriSize +'Ko)</span><br>';
							html += 'Dimensions : <span>'+image.width + ' x ' + image.height +'</span></p>';
							html += '</div>'

							container.find('p.upload').html(html) ;

							//console.log(imageObj)
						}

					], function(err) {

						// -> Show error
						if ( err ) {
							err = $('<div class="alert alert-block alert-error" style="margin-bottom:0"><button type="button" class="close" data-dismiss="alert">×</button><h4>Warning!</h4>'+err+'</div>') ;
							err.alert().bind('closed', function() {
								container.removeClass('uploading') ;
							})
							container.find('p.upload').html(err);
						}

						// -> All is complete
						else console.log('preview is complete')

					}) ;
				}
			}

		}))() ;

		// -> Init UI
		AdminUI.load() ;

	}) ;
})() ;										