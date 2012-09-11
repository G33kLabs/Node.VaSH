/*jshint node:true, curly:true, eqeqeq:true, onevar:true
   onevar:true */


var fs         = require('fs'),
   http        = require('http').request,
   https       = require('https').request,
   ins         = require('util').inspect,
   HOST        = 'disqus.com',
   SSL_HOST    = 'secure.disqus.com',
   INTERFACES  = JSON.parse(fs.readFileSync(root_path+'/libs/server/disqus-node/lib/interfaces.json', 'utf8'));

function APIError (code, message) {
   code           = code || 500;
   message        = message || "Unrecognized error";
   this.prototype = Error.prototype;
   this.name      = "APIError";
   this.message   = code +" "+ message;
}

function Response (request, textResponse) {
   var response   = JSON.parse(textResponse.replace("undefined",""));

   this.feed  = response.response;
   this.cursor = response.cursor ;
   this.request   = request;

   if (response.code !== 0) {
      throw new APIError(response.code, response.response);
   }
}

Response.prototype = {
   toString: function () {
      return JSON.stringify(this.response);
   },

   iter: function (fn) {
      return this.response.forEach(fn);
   },

   len: function () {
      return this.response.length;
   },

   getSlice: function (start, end) {
      return this.response.slice(start, end);
   },

   getItem: function (key) {
      return this.response[key];
   },

   contains: function (key) {
      return !!this.response[key];
   }
};

function Request (api, endpoint, method) {
   var that = this;

   function validateInterface (endpointKey, methodKey) {
      var endpoint = INTERFACES[endpointKey],
         method;

      if (endpoint) {
         that.endpoint  = endpointKey;
         method = endpoint[methodKey];

         if (method) {
            that.method       = methodKey;
            that.httpMethod   = method.method;
            that.required     = method.required;
         } else {
            throw new Error("Method not defined.");
         }
      } else {
         throw new Error("Interface not defined.");
      }
   }

   this.key       = api.key;
   this.version   = api.version;
   this.isSecure  = api.isSecure;
   this.format    = api.format;

   validateInterface(endpoint, method);
}

Request.prototype = {
   call: function (params, userCallback) {
      var that       = this,
         required    = this.required,
         path        = "",
         query       = "?",
         key,
         callback;

      if (required && required.length > 0) {
         this.required.forEach(function (requiredParam) {
            if (!params[requiredParam]) {
               throw new Error("Required Parameter missing.");
            }
         });
      }

      path = "/api/" + 
         [this.version, this.endpoint, this.method].join('/') +
         '.' + this.format;

      for (key in params) {
         if (Object.prototype.hasOwnProperty.call(params, key)) {
            query += key +'='+ params[key] + '&'; 
         }
      }
      query += 'api_key='+ this.key;

      options = {
         "path": path + query,
         "method": this.httpMethod,
         "headers": {
            "user-agent"      : "disqus-node/"+this.version,
            "content-length"  : 0
         }
      }; 

      callback = function (response) {
         var body;

         response.on('data', function (chunk) {
            body += chunk;
         });

         response.on('end', function () {
            userCallback(new Response(that, body));
         });
      };

      if (this.isSecure) {
         options.host = SSL_HOST;
         options.port = 443;

         request = https(options, callback);
      } else {
         options.host = HOST;
         options.port = 80;

         request = http(options, callback);
      }
      request.end();
   }
};

function DISQUS (key, format, version, isSecure) {
   this.key       = key;
   this.format    = format || 'json';
   this.version   = version || '3.0';
   this.isSecure  = isSecure;
}

DISQUS.prototype = {
   call: function (node, method, params, cb) {
      var resource = new Request(this, node, method);
      resource.call(params, cb);
   },

   setKey: function (newKey) {
      this.key = newKey;
   },

   setFormat: function (newFormat) {
      this.format = newFormat;
   },

   setVersion: function (newVersion) {
      this.version = newVersion;
   },

   setSecure: function (isSecure) {
      this.isSecure = isSecure;
   }
};

module.exports = function (key, format, version, isSecure) {
   return new DISQUS(key, format, version, isSecure);
};
