# Node.VaSH [ALPHA] #

## Description ##

*You have a dedicated server and want to try one of the most faster blog in the world ? Try it :)*

VaSh is a content manager aka a blog engine powered by **[node.js](http://nodejs.org/ "View Node.js Website")** and **[Redis](http://redis.io/ "View Redis Website")**.
All is driven by memory cache (static content + database) so it's really really... really fast !

Including a **cluster architecture**, VaSh is also **highly scalable** and can host **multi blogs**.
As well as others blogs, it includes templates, widgets, internationalization, and auto translate features.

Finally, it offers **Single Sign On** login system to help users to log them with auth providers (facebook, google, yahoo, openid, twitter, linkedin...)
Once connected, users can publish comments, talk...

### Features

- Scalable
- Load balancing
- Very very fast
- Multi platform
- Widgets (twitter, analytics...)
- SSO (Login with facebook, twitter, google...)
- Comments
- <del>Templates</del> *(in beta)*
- <del>Live chat</del>  *(in beta)*
- <del>Internationalization</del> *(in beta)*
- <del>Auto translate</del> *(in beta)*

### Requirements

``` bash
Install Redis...
Visit url ==> http://redis.io/download

Install Node.js...
Visit url ==> http://node.js
```

### Installation
As you're a G33K and have no GUI :
``` bash
$ git clone --recursive git@github.com:G33kLabs/Node.VaSH.git
$ cd Node.VaSH
$ npm update
```

### Configure it

An automated installer is planified in beta version, but for moment, you've to customize your blog with editing a config file with a text editor : `sites/default/config.js`

#### Site informations

```
// -> Site name, Brand & copyright in footer
site_name: 'JS> Node',
brand: "JS> Node",
copyright: "© G33K Labs | 2012",
```

#### Main website url
```
// -> Production env base url (used for rss feed and permanent links)
website: 'http://www.js2node.com',
```

#### Dev website url
```
// -> Development env base url (used when dev flag is enabled in app config)
local: 'http://local.js2node.com:10000',
```

#### Alias hostnames
```
// -> Alias responding to this config, will answer to 
// - http://local.js2node.com/ 
// - http://www.js2node.com/ 
// - http://localhost/
aliases: ['local.js2node.com', 'www.js2node.com', 'localhost'],
```

#### Default SEO tags
```
// -> Default SEO
title: "JS> Node",
title_sufix: " | G33K",
desc: "A developer blog about js, node.js and other modern tools",
desc_category: "Discover all articles about {{cat}}{{#page_count}} - Page{{page_count}}{{/page_count}}",
```

#### Menus in navbar (should be dynamic in beta version)
```
// -> Navbar menus
menus: ['Home', 'Nodejs', 'jQuery', 'Redis.io', 'Snippets', 'Contact'],
```

#### Activate widgets
```
// -> Widget loaded
widgets: ['aboutme', 'mostviewed', 'github', 'disqus', 'blogroll', 'archives', 'lazyload', {
	id: 'analytics',
	code: 'Enter here your google analytics code'
}],
```

#### Assets to package in one file and load
```
// -> Assets loaded and packed
assets: {
    css: [
        '/common/vendors/bootstrap/bootstrap.css', 
        '/common/vendors/markdown/highlight.monokai.css',
        '/assets/css/app.css'
    ],
    js: [
        '/common/vendors/jquery.min.js', 
        '/common/vendors/async.min.js', 
        '/common/vendors/date.min.js', 
        '/common/vendors/mustache.min.js', 
        '/common/vendors/underscore.min.js', 
        '/common/vendors/backbone.min.js', 
        '/common/vendors/bootstrap/bootstrap.js', 
        '/common/vendors/jquery.lazyload.min.js', 
        '/common/vendors/humanized_time_span.js', 
        '/common/vendors/jquery.oembed.min.js',
        '/common/vendors/jquery.social/jquery.fb.js',
        '/common/vendors/jquery.social/jquery.gplus.js',
        '/common/vendors/jquery.social/jquery.twitter.js',
        '/common/vendors/VaSH.toolkit.js/vash.toolkit.js', 
        '/assets/js/app.js'
    ]
},
```

#### SSO providers for login
```
// -> Single Sign On allowed providers
providers: {
    facebook: {
        infos: {
            clientID: 'type yours',
            clientSecret: 'type yours'
        },
        opts: {
            perms: {scope: 'email'}
        }
    },
    twitter: {
        infos: {
            consumerKey: 'type yours',
            consumerSecret: 'type yours'
        } 
    },
    github: {
        infos: {
            clientID: 'type yours',
            clientSecret: 'type yours'
        }
    }
},
```

#### Define admins
```
// -> Define admins => "provider"_"userid"
admins: ['twitter_244561106', 'facebook_582526084'],
```

#### Define users
```
author: 'email@domain.com',
authors: {
    'email@domain.com': {
        pseudo: 'G33K',
        name: 'Guillaume DE LA RUE',
        avatar: 'https://profiles.google.com/s2/photos/profile/115555146160120072472',
        profile: 'https://plus.google.com/115555146160120072472/posts',

		// -> Used in 'About Me' widget
        city: 'Paris',
        country: 'France',
        job: 'Consultant / Développeur',
        employer: 'G33kLabs',
        social: {
            twitter: {
                provider: 'Twitter',
                id: '244561106',
                pseudo: '@G33kLabs',
                profile: 'https://twitter.com/G33kLabs',
                classname: 'color_fluoblue'
            },
            github: {
                provider: 'Github',
                pseudo: '@G33kLabs',
                profile: 'https://github.com/G33kLabs',
                classname: 'color_greenlight'
            },
            google: {
                provider: 'Google+',
                id: '115555146160120072472',
                pseudo: '@G33k',
                profile: 'https://plus.google.com/115555146160120072472/',
                classname: 'color_yellow'
            }
        }
    }
}
```

### Run it

```
$ node app.js
```

### Test it

Open your browser and enter the url configured (you can see that in logs) :

```
20:45:18 [*] 1 | WebServer STARTED : http://localhost:10000/
```

### Credits
- [Node.js](http://nodejs.org/)
- [Redis](http://redis.io/)
- [ExpressJS](http://expressjs.com/)
- [Socket.IO](http://socket.io/)
- [BackBone](http://backbonejs.org/)
- [UnderscoreJS](http://underscorejs.org/ )
- [MustacheJS](https://github.com/janl/mustache.js/)