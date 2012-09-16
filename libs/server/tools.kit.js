////////////////////////////////////////////////////////////////////////// DECLARE GLOBALS
GLOBAL._ = require('underscore') ;
GLOBAL.Backbone = require('backbone') ;
GLOBAL.json = JSON.stringify ;
GLOBAL.async = require('async') ;

// -- Short for json stringhify function
GLOBAL.json = JSON.stringify ;
exports.json = JSON.stringify ;

////////////////////////////////////////////////////////////////////////// LOAD LIBS
exports.crypto = require('crypto') ;
exports.sys = require('util') ;
exports.path = require('path') ;
exports.url = require('url') ;
exports.colors = require('./termcolors.js').colors ;

var fs = require('fs') ;

////////////////////////////////////////////////////////////////////////// TRY TO LOAD CLUSTER MODULE
var cluster;
try {
    cluster = require('cluster') ;
} catch(e) {} ;

///////////////////////////////////////////////////////////////////////// CONSOLE LOGGING
// Log & error functions
exports.log = function(obj, color) { 
    color = color || 'green'; 

    //console.log(cluster.worker.id) ;

    obj = exports.trim((typeof obj == 'string' ) ? obj : json(obj, null, 4)) ;
    var log_ddate = (new Date()) ;
    var hours = log_ddate.getHours()+"" ;
    var minutes = log_ddate.getMinutes()+"" ;
    var seconds = log_ddate.getSeconds()+"" ;
    log_ddate = (hours.length < 2 ? '0' : '')+hours+':'+(minutes.length < 2 ? '0' : '')+minutes+':'+(seconds.length < 2 ? '0' : '')+seconds
    //exports.sys.puts(exports.colors[color](log_ddate+' '+exports.trim(obj), true)) ; 

    // -- Add log prefix if not yet present
    if ( ! /^(\ \[|\[)/.test(obj) ) obj = '[ ] '+obj; 

    // -- Add cluster informations
    //(cluster&&cluster.worker?cluster.worker.id+' | ':'')+
    if ( cluster ) {
        var cluster_id = cluster.worker ? cluster.worker.id : 'M' ;
        if ( ! (/^\[(.*)\] \d/).test(obj) ) {
            obj = obj.replace(/^\[(.*)\]/, '[$1] '+cluster_id+ ' |') ;
            //console.log(obj.replace(/^\[(.*)\]/, '[$1] '+cluster_id+ ' | '))
            //console.log(cluster_id) ;
        }
    }

    // -- Ouput it
    if ( typeof logger != 'object' ) {
        exports.sys.puts(exports.colors[color](log_ddate+' '+exports.trim(obj), true)) ; 
    }
    else {
        logger.write(exports.colors[color](log_ddate+' '+exports.trim(obj), true)+"\n");
    }
}
exports.debug = function(obj) { exports.log(obj, 'lgray') ; }
exports.error = function(obj) { exports.log(obj, 'red') ; }
exports.warning = function(obj) { exports.log(obj, 'brown') ; }


/*******************************************************************
 * Objects operations
 *******************************************************************/
exports.extend = function() {
    var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
    i = 1,
    length = arguments.length,
    deep = false,
    toString = Object.prototype.toString,
    hasOwn = Object.prototype.hasOwnProperty,
    push = Array.prototype.push,
    slice = Array.prototype.slice,
    trim = String.prototype.trim,
    indexOf = Array.prototype.indexOf,
    class2type = {
      "[object Boolean]": "boolean",
      "[object Number]": "number",
      "[object String]": "string",
      "[object Function]": "function",
      "[object Array]": "array",
      "[object Date]": "date",
      "[object RegExp]": "regexp",
      "[object Object]": "object"
    },
    jQuery = {
      isFunction: function (obj) {
        return jQuery.type(obj) === "function"
      },
      isArray: Array.isArray ||
      function (obj) {
        return jQuery.type(obj) === "array"
      },
      isWindow: function (obj) {
        return obj != null && obj == obj.window
      },
      isNumeric: function (obj) {
        return !isNaN(parseFloat(obj)) && isFinite(obj)
      },
      type: function (obj) {
        return obj == null ? String(obj) : class2type[toString.call(obj)] || "object"
      },
      isPlainObject: function (obj) {
        if (!obj || jQuery.type(obj) !== "object" || obj.nodeType) {
          return false
        }
        try {
          if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
            return false
          }
        } catch (e) {
          return false
        }
        var key;
        for (key in obj) {}
        return key === undefined || hasOwn.call(obj, key)
      }
    };
  if (typeof target === "boolean") {
    deep = target;
    target = arguments[1] || {};
    i = 2;
  }
  if (typeof target !== "object" && !jQuery.isFunction(target)) {
    target = {}
  }
  if (length === i) {
    target = this;
    --i;
  }
  for (i; i < length; i++) {
    if ((options = arguments[i]) != null) {
      for (name in options) {
        src = target[name];
        copy = options[name];
        if (target === copy) {
          continue
        }
        if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
          if (copyIsArray) {
            copyIsArray = false;
            clone = src && jQuery.isArray(src) ? src : []
          } else {
            clone = src && jQuery.isPlainObject(src) ? src : {};
          }
          // WARNING: RECURSION
          target[name] = exports.extend(deep, clone, copy);
        } else if (copy !== undefined) {
          target[name] = copy;
        }
      }
    }
  }
  return target;
}


/*******************************************************************
 * Format operations
 *******************************************************************/
// -- Return filesize
exports.formatSize = function(bytes) {
	var labels = new Array('TB', 'GB', 'MB', 'kB', 'b');
	var measurements = new Array(1099511627776, 1073741824, 1048576, 1024, 1);
	for(var i=0; i<measurements.length; i++) {
		var conv = bytes/measurements[i];
		if(conv > 1) {
			return exports.number_format((conv*10)/10, 3, '.')+' '+labels[i];
		}
	}
}

// -- Format time
exports.formatTime = function(ms) {
    var secs = ms/1000 ;
    var hr = Math.floor(secs / 3600);
    var min = Math.floor((secs - (hr * 3600))/60);
    var sec = Math.floor(secs - (hr * 3600) - (min * 60));
    
    if (hr < 10) hr = "0" + hr;
    if (min < 10) min = "0" + min;
    if (sec < 10) sec = "0" + sec;
    if (hr) hr = "00";
    return (hr > 0 ? hr + ':' : '') + min + ':' + sec;
}

// -- Return seconds with duration like 00:00:00 or 00:00
exports.formatDuration = function(duration) {
    duration = (duration||'').split(':') ;
    var seconds = 0 ; 
    if ( duration.length == 3 ) seconds += parseInt(duration.shift())*3600;
    seconds += parseInt(duration.shift())*60;
    seconds += parseInt(duration.shift());
    return seconds;
}

// -- Return ms with duration like 00:00:00 or 00:00
exports.formatDuration_ms = function(duration) {
    return exports.formatDuration(duration)*1000;
}

// -- Number Format
exports.number_format = function(number, decimals, dec_point, thousands_sep) {
    number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}

// -- Check email
exports.validateEmail = function(email){
    return /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(email);
}

/*******************************************************************
 * Camelize/Uncamelize a string (border-bottom <-> borderBottom)
 *******************************************************************/

exports.camelize = function(str) {
    return (str + "").replace(/-\D/g, function(match) {
        return match.charAt(1).toUpperCase();
    });
}

exports.hyphenate = function(str) {
    return (str + "").replace(/[A-Z]/g, function(match) {
        return "-" + match.toLowerCase();
    });
}


/*******************************************************************
 * Path walking
 *******************************************************************/

// -- Walk directory
exports.walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          exports.walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push({path: file, mtime: stat.mtime, size: stat.size});
          next();
        }
      });
    })();
  });
};

// -- Recursive mkdir -p
exports.createFullPath = function(fullPath, callback) {
    var parts = exports.path.dirname(exports.path.normalize(fullPath)).split("/"),
        working = '/',
        pathList = [];
    
    for(var i = 0, max = parts.length; i < max; i++) {
        working = exports.path.join(working, parts[i]);
        pathList.push(working);
    }

    console.log('---------------------------------------')
    console.log(pathList)
    console.log('---------------------------------------')

    var recursePathList = function recursePathList(paths) {
        if(0 === paths.length) { callback(null); return ; }
        var working = paths.shift();
        try {
            console.log('--> '+working)
            fs.exists(working, function(exists) {
                if(!exists) {
                    try {
                        fs.mkdir(working, 0755, function(err, success) {
                            if ( err ) console.log(err)
                            console.log(success)
                            recursePathList(paths);
                        });
                    } catch(e) {
                        callback(new Error("Failed to create path: " + working + " with " + e.toString()));
                    }
                } else { recursePathList(paths); }
            });
        } catch(e) { callback(new Error("Invalid path specified: " + working)); }
    }
    
    if(0 === pathList.length) callback(new Error("Path list was empty"));
    else recursePathList(pathList);
}

/////////////////////////////////////////////////////////////////// STRING FUNCTIONS

// -- Return an integer random value
exports.rand = function() {
	var r = Math.random() ;
	var args = [] ;
	for ( i in arguments ) args.push(arguments[i]) ;

	if ( args.length == 0 ) return Math.floor(r*10000000000000000) ;
	else if ( args.length == 1 ) return Math.floor(r*args[0]) ;
	else if ( args.length == 2 ) return parseFloat(args[0]) + Math.floor(r*(args[1]-args[0])) ;
}

// -- Return now timestamp
exports.now = function() {
	return (new Date().getTime()) ;
}

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

// -- Return filename extension
exports.extension = function(fileName) {
    return fileName.substr(fileName.lastIndexOf('.') + 1);
} ;

// -- Sripslashes
exports.stripslashes = function(str) {
	str=(str||'').replace(/\\'/g,'\'');
	str=str.replace(/\\"/g,'"');
	str=str.replace(/\\0/g,'\0');
	str=str.replace(/\\\\/g,'\\');
	return str;
}

// -- Striptags (phpjs) 
exports.strip_tags = function (input, allowed, replacement) {
    allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
}

// -- Return md5
exports.md5 = function(str) {
	return exports.crypto.createHash('md5').update(str).digest("hex");
}

// -- Clean a string from json
exports.cleanStr = function(str) {
	return (str||'').replace(/^\s+|\s+$/g,"").replace(/^\"(.*)\"$/, "$1");
}

// -- Return a clean html string
exports.cleanHtml = function(html) {
	html = html || '' ;
	
	// -- Replace unused tabs and retuns
	html = html.replace(/\n/g, '') ;
	html = html.replace(/\r/g, '') ;
	html = html.replace(/\t/g, '') ;
	
	// -- Remove xml header for dom parsing
	html = html.replace('<?xml version="1.0" encoding="ISO-8859-1"?>', '') ;
	//html = '<html'+html.split('<html')[1] ;
	
	// -- Trim html
	html = exports.trim(html) ;
	
	// -- Return formated html
	return html ;
	
}

// -- Return a clean number from string
exports.cleanNumber = function(str) {
	return parseFloat((str||'').replace(/ /g, '')) ;
}

/////////////////////////////////////////////////////////////////// CACHE

// -- Return a permalink
exports.permalink = function(str) {
    return str.replace(/[^a-z0-9]+/gi, '-').replace(/^-*|-*$/g, '').toLowerCase();
}

// -- Return teaser
exports.teaser = function (input, maxChars) {
    // token matches a word, tag, or special character
    var token = /\w+|[^\w<]|<(\/)?(\w+)[^>]*(\/)?>|</g,
        selfClosingTag = /^(?:[hb]r|img)$/i,
        output = "",
        charCount = 0,
        openTags = [],
        match;

    // Set the default for the max number of characters
    // (only counts characters outside of HTML tags)
    maxChars = maxChars || 250;

    while ((charCount < maxChars) && (match = token.exec(input))) {
        // If this is an HTML tag
        if (match[2]) {
            output += match[0];
            // If this is not a self-closing tag
            if (!(match[3] || selfClosingTag.test(match[2]))) {
                // If this is a closing tag
                if (match[1]) openTags.pop();
                else openTags.push(match[2]);
            }
        } else {
            charCount += match[0].length;
            if (charCount <= maxChars) output += match[0];
        }
    }

    // Close any tags which were left open
    var i = openTags.length;
    while (i--) output += "</" + openTags[i] + ">";
    
    return output;
};
	
// -- Return a formated process mem usage in Mb -------------
// tools.getMemUsage(mem, function (data) {
//	    console.log(data) ; 	// 115.62
//	}) ;
// ----------------------------------------------------------
exports.getMemUsage = function(mem) {
	if ( ! mem || ! mem.heapTotal ) return false;
	return (mem.rss/1024/1024).toFixed(2) ;
}

// -- Return public ip address ------------------------------
exports.getServerIp = function() {
	var os=require('os'),
		ifaces=os.networkInterfaces(),
		ips = [];

	for (var dev in ifaces) {
		ifaces[dev].forEach(function(details){
			if (details.family=='IPv4' && details.address != '127.0.0.1') {
				ips.push(details.address) ;
			}
		});
	}
	return ips ;
}


exports.str_pad = function (input, pad_length, pad_string, pad_type) {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // + namespaced by: Michael White (http://getsprink.com)
    // +      input by: Marco van Oort
    // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
    // *     example 1: str_pad('Kevin van Zonneveld', 30, '-=', 'STR_PAD_LEFT');
    // *     returns 1: '-=-=-=-=-=-Kevin van Zonneveld'
    // *     example 2: str_pad('Kevin van Zonneveld', 30, '-', 'STR_PAD_BOTH');
    // *     returns 2: '------Kevin van Zonneveld-----'
    var half = '',
        pad_to_go;

    var str_pad_repeater = function (s, len) {
        var collect = '',
            i;

        while (collect.length < len) {
            collect += s;
        }
        collect = collect.substr(0, len);

        return collect;
    };

    input += '';
    pad_string = pad_string !== undefined ? pad_string : ' ';

    if (pad_type != 'STR_PAD_LEFT' && pad_type != 'STR_PAD_RIGHT' && pad_type != 'STR_PAD_BOTH') {
        pad_type = 'STR_PAD_RIGHT';
    }
    if ((pad_to_go = pad_length - input.length) > 0) {
        if (pad_type == 'STR_PAD_LEFT') {
            input = str_pad_repeater(pad_string, pad_to_go) + input;
        } else if (pad_type == 'STR_PAD_RIGHT') {
            input = input + str_pad_repeater(pad_string, pad_to_go);
        } else if (pad_type == 'STR_PAD_BOTH') {
            half = str_pad_repeater(pad_string, Math.ceil(pad_to_go / 2));
            input = half + input + half;
            input = input.substr(0, pad_length);
        }
    }

    return input;
}


// -- PHPJS : base64 encode & decode
exports.base64_encode = function(data){var b64="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var o1,o2,o3,h1,h2,h3,h4,bits,i=0,ac=0,enc="",tmp_arr=[];if(!data){return data;}
data=exports.utf8_encode(data+'');do{o1=data.charCodeAt(i++);o2=data.charCodeAt(i++);o3=data.charCodeAt(i++);bits=o1<<16|o2<<8|o3;h1=bits>>18&0x3f;h2=bits>>12&0x3f;h3=bits>>6&0x3f;h4=bits&0x3f;tmp_arr[ac++]=b64.charAt(h1)+b64.charAt(h2)+b64.charAt(h3)+b64.charAt(h4);}while(i<data.length);enc=tmp_arr.join('');switch(data.length%3){case 1:enc=enc.slice(0,-2)+'==';break;case 2:enc=enc.slice(0,-1)+'=';break;}
return enc;}

exports.base64_decode = function(data){var b64="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var o1,o2,o3,h1,h2,h3,h4,bits,i=0,ac=0,dec="",tmp_arr=[];if(!data){return data;}
data+='';do{h1=b64.indexOf(data.charAt(i++));h2=b64.indexOf(data.charAt(i++));h3=b64.indexOf(data.charAt(i++));h4=b64.indexOf(data.charAt(i++));bits=h1<<18|h2<<12|h3<<6|h4;o1=bits>>16&0xff;o2=bits>>8&0xff;o3=bits&0xff;if(h3==64){tmp_arr[ac++]=String.fromCharCode(o1);}else if(h4==64){tmp_arr[ac++]=String.fromCharCode(o1,o2);}else{tmp_arr[ac++]=String.fromCharCode(o1,o2,o3);}}while(i<data.length);dec=tmp_arr.join('');dec=exports.utf8_decode(dec);return dec;}

exports.utf8_decode = function(str_data){var tmp_arr=[],i=0,ac=0,c1=0,c2=0,c3=0;str_data+='';while(i<str_data.length){c1=str_data.charCodeAt(i);if(c1<128){tmp_arr[ac++]=String.fromCharCode(c1);i++;}else if((c1>191)&&(c1<224)){c2=str_data.charCodeAt(i+1);tmp_arr[ac++]=String.fromCharCode(((c1&31)<<6)|(c2&63));i+=2;}else{c2=str_data.charCodeAt(i+1);c3=str_data.charCodeAt(i+2);tmp_arr[ac++]=String.fromCharCode(((c1&15)<<12)|((c2&63)<<6)|(c3&63));i+=3;}}
return tmp_arr.join('');}
exports.utf8_encode = function(string){string=(string+'').replace(/\r\n/g,"\n").replace(/\r/g,"\n");var utftext="";var start,end;var stringl=0;start=end=0;stringl=string.length;for(var n=0;n<stringl;n++){var c1=string.charCodeAt(n);var enc=null;if(c1<128){end++;}else if((c1>127)&&(c1<2048)){enc=String.fromCharCode((c1>>6)|192)+String.fromCharCode((c1&63)|128);}else{enc=String.fromCharCode((c1>>12)|224)+String.fromCharCode(((c1>>6)&63)|128)+String.fromCharCode((c1&63)|128);}
if(enc!=null){if(end>start){utftext+=string.substring(start,end);}
utftext+=enc;start=end=n+1;}}
if(end>start){utftext+=string.substring(start,string.length);}
return utftext;}

// -- Sprintf
// This code is in the public domain. Feel free to link back to http://jan.moesen.nu/
exports.sprintf = function() {
    if (!arguments || arguments.length < 1 || !RegExp) {
        return;
    }

    var str = arguments[0];
    var re = /([^%]*)%('.|0|\x20)?(-)?(\d+)?(\.\d+)?(%|b|c|d|u|f|o|s|x|X)(.*)/;
    var a = b = [], numSubstitutions = 0, numMatches = 0;
    while (a = re.exec(str)) {
        var leftpart = a[1], pPad = a[2], pJustify = a[3], pMinLength = a[4];
        var pPrecision = a[5], pType = a[6], rightPart = a[7];

        numMatches++;

        if (pType == '%') {
            subst = '%';
        } else {
            numSubstitutions++;
            if (numSubstitutions >= arguments.length) {
                exports.error('Error! Not enough function arguments (' + (arguments.length - 1) + ', excluding the string)\nfor the number of substitution parameters in string (' + numSubstitutions + ' so far).');
            }

            var param = arguments[numSubstitutions];
            var pad = '';
            if (pPad && pPad.substr(0,1) == "'") {
                pad = leftpart.substr(1,1);
            } else if (pPad) {
                pad = pPad;
            }

            var justifyRight = true;
            if (pJustify && pJustify === "-") {
                justifyRight = false;
            }

            var minLength = -1;
            if (pMinLength) {
                minLength = parseInt(pMinLength);
            }

            var precision = -1;
            if (pPrecision && pType == 'f') {
                precision = parseInt(pPrecision.substring(1));
            }

            var subst = param;
            if (pType == 'b') {
                subst = parseInt(param).toString(2);
            } else if (pType == 'c') {
                subst = String.fromCharCode(parseInt(param));
            } else if (pType == 'd') {
                subst = parseInt(param) ? parseInt(param) : 0;
            } else if (pType == 'u') {
                subst = Math.abs(param);
            } else if (pType == 'f') {
                subst = (precision > -1) ? Math.round(parseFloat(param) * Math.pow(10, precision)) / Math.pow(10, precision): parseFloat(param);
            } else if (pType == 'o') {
                subst = parseInt(param).toString(8);
            } else if (pType == 's') {
                subst = param;
            } else if (pType == 'x') {
                subst = ('' + parseInt(param).toString(16)).toLowerCase();
            } else if (pType == 'X') {
                subst = ('' + parseInt(param).toString(16)).toUpperCase();
            }
        }

        str = leftpart + subst + rightPart;
    }

    return str;
}

/*Accepts a Javascript Date object as the parameter;
  outputs an RFC822-formatted datetime string. */
exports.GetRFC822Date = function (oDate) {
    var aMonths = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
    
    var aDays = new Array( "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
    var dtm = new String();
            
    dtm = aDays[oDate.getDay()] + ", ";
    dtm += padWithZero(oDate.getDate()) + " ";
    dtm += aMonths[oDate.getMonth()] + " ";
    dtm += oDate.getFullYear() + " ";
    dtm += padWithZero(oDate.getHours()) + ":";
    dtm += padWithZero(oDate.getMinutes()) + ":";
    dtm += padWithZero(oDate.getSeconds()) + " " ;
    dtm += getTZOString(oDate.getTimezoneOffset());
    return dtm;
}

// Pads numbers with a preceding 0 if the number is less than 10.
function padWithZero(val) {
    if (parseInt(val) < 10) return "0" + val;
    return val;
  }

/* accepts the client's time zone offset from GMT in minutes as a parameter.
  returns the timezone offset in the format [+|-}DDDD */
function getTZOString(timezoneOffset) {
    var hours = Math.floor(timezoneOffset/60);
    var modMin = Math.abs(timezoneOffset%60);
    var s = new String();
    s += (hours > 0) ? "-" : "+";
    var absHours = Math.abs(hours)
    s += (absHours < 10) ? "0" + absHours :absHours;
    s += ((modMin == 0) ? "00" : modMin);
    return(s);
} ;

// Declare as a global var : tools
GLOBAL.tools = exports ;