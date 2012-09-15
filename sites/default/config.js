module.exports =  {

    // -> Site name, Brand & copyright in footer
    site_name: 'JS> Node',
    brand: "JS> Node",
    copyright: "&copy; G33K Labs | 2012",

    // -> Production env base url (used for rss feed and permanent links)
    website: 'http://www.js2node.com',

    // -> Development env base url (used when dev flag is enabled in app config)
    local: 'http://local.js2node.com:10000',

    // -> Alias responding to this config, will answer to 
    // - http://local.js2node.com/ 
    // - http://www.js2node.com/ 
    // - http://localhost/
    aliases: ['localhost'],  

    // -> Default SEO
    title: "JS> Node",
    title_sufix: " | G33K",
    desc: "A developer blog about js, node.js and other modern tools",
    desc_category: "Discover all articles about {{cat}}{{#page_count}} - Page{{page_count}}{{/page_count}}",
    language: 'en-EN',

    // -> Navbar menus
    menus: ['Home', 'Nodejs', 'jQuery', 'Redis.io', 'Snippets', 'Contact'],

    // -> Widget loaded
    widgets: ['aboutme', 'mostviewed', 'github', 'disqus', 'blogroll', 'archives', 'lazyload', {
        id: 'analytics',
        code: 'type yours'
    }],

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
    admins: ['twitter_244561106', 'facebook_582526084'],
    author: 'email@domain.com',
    authors: {
        'email@domain.com': {
            pseudo: 'G33K',
            name: 'Guillaume DE LA RUE',
            avatar: 'https://profiles.google.com/s2/photos/profile/115555146160120072472',
            profile: 'https://plus.google.com/115555146160120072472/posts',
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
}