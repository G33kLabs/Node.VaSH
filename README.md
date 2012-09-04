# Node.VaSH [ALPHA] #

## Description ##

*You have a dedicated server and want to try one of the most faster blog in the world ? Try it :)*

VaSh is a content manager aka a blog engine powered by **[node.js](http://nodejs.org/ "View Node.js Website")** and **[Redis](http://redis.io/ "View Redis Website")**.
All is driven by memory cache (static content + database) so it's really really... really fast !

Including a **cluster architecture**, VaSh is also **highly scalable** and can host **multi blogs**.
As well as others blogs, it includes templates, widgets, internationalization, and auto translate features.

Finally, it offers **Single Sign On** login system to help users to log them with auth providers (facebook, google, yahoo, openid, twitter, linkedin...)
Once connected, users can publish comments, talk...

## Features ##

- Scalable
- Load balancing
- Very very fast
- Multi platform
- Templates
- Widgets (twitter, analytics...)
- SSO (Login with facebook, twitter, google...)
- Comments
- Live chat
- Internationalization
- Auto translate

## Installation ##

``` bash
$ echo "[>] Install Redis..."
$ echo "Visit url ==> http://redis.io/download"

$ echo "[>] Install Node.VaSH..."
$ npm install express.vash
```

## Get Started ##

``` js
// -- Load Libs
var express = require('express'),
	app = express(),
	http = require('http'),
    server = http.createServer(app) ;

// -- Add vash to express
express.vash = require('express.vash') ;

// -- Add as middleware
app.use(express.vash());
```

## Credits ##
- [node.js](http://nodejs.org/)
- [Redis](http://redis.io/)
- [ExpressJS](http://expressjs.com/)
- [Socket.IO](http://socket.io/)
- [BackBone](http://backbonejs.org/)
- [UnderscoreJS](http://underscorejs.org/ )
- [MustacheJS](https://github.com/janl/mustache.js/)
