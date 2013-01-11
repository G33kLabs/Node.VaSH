/*!
 * vash.packer.js - Javascript node compressor
 * http://github.com/G33kLabs/Node.VaSH.packer
 */

/*global define: false*/

var htmlPacker = require('html-minifier').minify,
	jsParser = require("uglify-js").parser,
	jsPacker = require("uglify-js").uglify,
	cssPacker = require('uglifycss') ;

(function (exports) {
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
		module.exports = exports; // CommonJS
	} else {
		window.packer = exports; // <script>
	}
}(function () {
  	var exports = {};

	// Pack CSS content 
	exports.packCSS = function(content) {
		return cssPacker.processString(content) ;
	} ;

	// Pack HTML content 
	exports.packHTML = function(content) {
		return htmlPacker(content, { removeComments: true, collapseWhitespace: false, removeEmptyAttributes: true }) ;
	} ;

	// Pack JS content
	exports.packJS = function(content, itemPath) {

		// -- Catch error
		try {
			var ast = jsParser.parse(content); // parse code and get the initial AST
			ast = jsPacker.ast_mangle(ast); // get a new AST with mangled names
			ast = jsPacker.ast_squeeze(ast); // get an AST with compression optimizations
		} 

		// -- Scope error
		catch(e) { 			
			tools.error('-------------------------') ;
			tools.error(content.split("\n").slice(e.line-10, e.line-1).join("\n")) ;
			tools.warning(" /******** "+e.line+" >> "+e.message+" ********/") ;
			tools.warning((content.split("\n").slice(e.line-1, e.line).join("\n"))) ;
			tools.warning(" /***********************************************************/") ;
			tools.error(content.split("\n").slice(e.line, e.line+10).join("\n")) ;
			this.compileError = true ;
			require('child_process').exec('say -v Alex -r 200 "What the fuck baby ? "') ;	
		} 
		return jsPacker.gen_code(ast); // compressed code here
		
	} ;

  	return exports;
}()));