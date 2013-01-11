(function(exports, isNode) {

	var widgetId = 'disqus' ;
	var widget = Backbone.Model.extend({

		// -- Basic configuration (id and title are required)
		id: widgetId,
		title: 'Last Comments',

		// -- Defaults
		defaults: {
			shortname: 'jsnode',
			api_key: "y9ykP9ZWu6BwVrZcC8b2iu0XMT7WJNNYmlf2guc807jKsMG9CAroAEBA73i1N8GZ"
		},

		// -- Init 
		initialize: function() {
			/*
			if ( isNode ) {
				  var disqus = require(root_path+'/libs/server/disqus-node/') ;
				  var dq = disqus(this.get('api_key'), 'json', '3.0', false);
				  dq.call('threads', 'list', {"forum": this.get('shortname')}, function (response) {
				     console.log(response.feed);
				     console.log(response.cursor);
				  });
			}
			*/
			return this;
		},

		// -> Executed on client render
		onClientRender: function() {

			// -> Look for DOM div infos
			var disqus_thread = $('#disqus_thread') ;
			if ( ! disqus_thread.length ) return false;

          	// DisqUS Comment module
            exports.disqus_shortname = this.get('shortname'); // required: replace example with your forum shortname
            exports.disqus_identifier = disqus_thread.data('identifier');
            exports.disqus_title = disqus_thread.data('title');
            //var disqus_developer = 1;

            /* * * DON'T EDIT BELOW THIS LINE * * */
            (function() {
                var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
                dsq.src = 'http://' + disqus_shortname + '.disqus.com/embed.js';
                (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
            })();

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