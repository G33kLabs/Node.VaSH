(function(exports, isNode) {

	var widgetId = 'github' ;
	var widget = Backbone.Model.extend({

		// -- Basic configuration
		id: widgetId,
		title: 'GitHub Issues',

		// -- Blogs:
		defaults: {
			user: 'G33kLabs',
			repositary: 'Node.VaSH',
			timeout: 10000,
			collapse: 2,
			milestone: {
				displayed: 1
			}
		},

		// -- Build issues list
		renderIssues: function(datas, callback) {
			var self = this; 

			// -> Filter datas
			var values = [], html = [], milestones = {} ;

			// -> Return since date
			var getSinceDate = function(issue) {
				if ( issue.closed_at ) return issue.closed_at ;
				else return (issue.updated_at!=issue.created_at?issue.updated_at:issue.created_at) ;
			}

			var getSinceText = function(issue) {
				if ( issue.closed_at ) return 'Closed' ;
				else return (issue.updated_at!=issue.created_at?'Updated':'Created') ;
			}

			// -> Sort keys by newt event
			values = _.sortBy(datas, function(issue) {
				return getSinceDate(issue) 
			}).reverse() ;

			// -> Build HTML
			_.each(values, function(issue) {
				var matches = issue.html_url.match(new RegExp("https://github.com/([a-zA-Z0-9.\-]+)/([a-zA-Z0-9.\-]+)/issues/")); 
				if ( matches ) issue.repositary = matches[2] ;
				issue.since = getSinceText(issue)+' '+humanized_time_span(getSinceDate(issue)) ;

				// -> Add milestone infos
				var groupName = ( issue.milestone && issue.milestone.title ) ? issue.milestone.title : 'Indie'
				milestones[groupName] = milestones[groupName] || [] ;
				milestones[groupName].push(issue) ;
				
	 		}) ;

	 		// -> Return html
			callback(null, milestones) ;

		},

		// ------------------------------------------- CLIENT METHODS -------------
		// -> Request Issues via AJAX API
		requestIssues: function(state, callback) {
			var self = this ;
			$.ajax({
				url: 'https://api.github.com/repos/'+self.get('user')+'/'+self.get('repositary')+'/issues?state='+(state=='opened'?'opened':'closed') ,
				dataType: 'jsonp',
				timeout: self.get('timeout'),
				error: function(err) { 
					callback(err.statusText)
				},
				success: function(res) {
					if ( ! res || ! res.data ) return callback(true); 
					self.renderIssues(res.data, function(err, html) {
						callback(err, html); 
					})
				}
			})
		},

		// -> Build milestones template datas
		build_milestones: function(datas) {
			var milestones = {} ;
			_.each(datas, function(groups) {
				_.each(groups, function(items, milestone_name) {
					var issues = [] ;
					milestones[milestone_name] = milestones[milestone_name] || {
						title: milestone_name, 
						issues: [],
						due_on: (new Date()).add(1).years(),
						open_issues: 0,
						closed_issues: 0
					}
					_.each(items, function(item) {
						if ( item.milestone ) {
							milestones[milestone_name].due_on = new Date(item.milestone.due_on)  ;
							milestones[milestone_name].open_issues = item.milestone.open_issues ;
							milestones[milestone_name].closed_issues = item.milestone.closed_issues ;
						}
						else {
							if ( item.state == 'closed' ) milestones[milestone_name].closed_issues++;
							else milestones[milestone_name].open_issues++
						}

						//console.log(milestone_name, item)

						milestones[milestone_name].due_date = humanized_time_span(milestones[milestone_name].due_on) ;
						milestones[milestone_name].total_issues = milestones[milestone_name].open_issues + milestones[milestone_name].closed_issues ;
						milestones[milestone_name].progress = Math.floor(milestones[milestone_name].closed_issues * 100 / milestones[milestone_name].total_issues) ;
						milestones[milestone_name].progressWidth = Math.max(10, milestones[milestone_name].progress)

						if ( new Date(milestones[milestone_name].due_on) > new Date() ) {
							if ( milestones[milestone_name].progress > 0 ) {
								milestones[milestone_name].progressClass = 'success' ;
							}
							else {
								milestones[milestone_name].progressClass = 'info' ;
							}
						}
						else {
							milestones[milestone_name].progressClass = 'danger' ;
						}	
											
						milestones[milestone_name].issues.push(item) ;	
					})
				})
			})

			// -> Sort milestones
			milestones = _.sortBy(milestones, function(milestone) {
				//console.log(new Date(milestone.due_on), (new Date()).add(1).years())
				return milestone.due_on ;
			});

			// -> Return complete datas
			return milestones; 
		},

		// -> Called by application loader
		onClientRender: function() {
			var self = this, widget = $('.widget-'+self.id) ; 

			// -> Hack mustache tags
			self.mu = _.clone(Mustache) ;
			self.mu.tags = ['[[', ']]'] ;

			// -> Get template
			self.tpl = widget.find('#issueTemplate').html() ;

			// -> Remove template from dom
			widget.find('#issueTemplate').remove() ;

			// -> HACK mustache client template
			self.tpl = self.tpl.replace(/\[\[/g, '{{').replace(/\]\]/g, '}}') ;

			// -> Get closed and opened statuses
			async.parallel({
				closed: function(callback) {
					self.requestIssues('closed', callback)
				},
				opened: function(callback) {
					self.requestIssues('opened', callback)
				}
			}, 

			// -> Replace html and call lazyload
			function(err, res) {

				// -> If request errors
				if ( err ) {
					widget.find('.issues').html("<div class='error'>GitHub API error : "+err+"</div>") ;
					return;
				}

				// -> Build milestones
				var milestones = self.build_milestones([res.opened, res.closed]) ;

				// -> Bind some effects
				var html = $(Mustache.to_html(self.tpl, {milestones: _.values(milestones)})) ;
				var first_milestone = html.filter('.milestone:first') ;

				// -> Hide others milestone
				html.filter('.milestone').slice(self.get('milestone').displayed).hide() ;

				// -> Show and hide action buttons
				first_milestone.find('.milestone-more').hide() ;
				html.filter('.milestone').not(':first').find('.issueTemplate, .issues-more').hide() ;

				// -> Filter datas
				var opened = first_milestone.find('.issueTemplate.state-open') ;
				var closed = first_milestone.find('.issueTemplate.state-closed') ;
				opened.slice(self.get('collapse')).hide() ;
				closed.slice(self.get('collapse')).hide() ;
				first_milestone.find('.issue-more').toggle(opened.length > self.get('collapse') || closed.length > self.get('collapse')) ;

				// -> Bind actions
				html.filter('.milestone').find('.milestone-more').on('click', function() {
					var el = $(this).closest('.milestone') ;
					el.find('.issueTemplate').show() ;
					$(this).hide() ;
				})
				html.filter('.milestone').find('.issues-more').on('click', function() {
					var el = $(this).closest('.milestone') ;
					el.find('.issueTemplate').show() ;
					html.filter('.milestone').show(); 
					$(this).hide() ;
				})

				// -> Replace html
				widget.find('.issues').html(html) ;

				// -> Load lazyload
				if ( widgets.lazyload && _.isFunction(widgets.lazyload.refresh) ) setTimeout(function() { widgets.lazyload.refresh() }, 1000);
			}) ;
		},

		// ------------------------------------------- SERVER METHODS -------------
		// -> On page render
		onServerRender: function() {
			this.attributes.title = this.title ; 
			return VaSH.Mustache.to_html(this.get('templates')['widget.'+this.id+'.html'], this.attributes);
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