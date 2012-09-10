/*!
 * vash.toolkit.js - Javascript tools for generic and useful usage
 * http://github.com/G33kLabs/vash.toolkit.js
 */

/*global define: false*/

(function (exports) {
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
		module.exports = exports; // CommonJS
	} else if (typeof define === "function") {
		define(exports); // AMD
	} else {
		window.tools = exports; // <script>
	}
}(function () {
  	var exports = {};

  	// -- Trim a string
	exports.trim = function(str) {
		return (str||'').replace(/^\s+|\s+$/g,"").toString();
	}

	// -- UpperCase words
	exports.ucwords = function(str) {
	    return (str + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
	        return $1.toUpperCase();
	    });
	} ;

	// -- Upper case first char
	exports.ucfirst = function (str) {
	    str += '';
	    var f = str.charAt(0).toUpperCase();
	    return f + str.substr(1);
	}

  	return exports;
}()));