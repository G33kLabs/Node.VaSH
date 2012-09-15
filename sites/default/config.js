module.exports =  {

    // -> Site name 
    site_name: 'JS> Node',

    // -> Brand name & copyright in footer
    brand: "JS> Node",
    copyright: "&copy; G33K Labs | 2012",

    // -> Production env base url
    website: 'http://www.js2node.com',

    // -> Development env base url
    local: 'http://local.js2node.com:10000',

    // -> Alias responding to this config, will answer to 
    // - http://local.js2node.com/ 
    // - http://www.js2node.com/ 
    // - http://localhost/
    aliases: ['local.js2node.com', 'www.js2node.com', 'localhost'],

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
        code: 'UA-12891268-5'
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
                clientID: '237318836391590',
                clientSecret: '68756c699154a542735bff3ac8b2edc9'
            },
            opts: {
                perms: {scope: 'email'}
            }
        },
        twitter: {
            infos: {
                consumerKey: 'rSW4OeSUcn33NeaID6Lw',
                consumerSecret: 'PuaP4Gh4esCLtlACJVLfdpMh3zA6UUVrSeR9saRmk18'
            } 
        },
        github: {
            infos: {
                clientID: 'bff9226f55a4f13ae031',
                clientSecret: 'b0b701d3e4e058ce1a14aaad90c0ecf410809f60'
            }
        }
    },
    admins: ['twitter_244561106', 'facebook_582526084'],
    author: 'delarueguillaume@gmail.com',
    authors: {
        'delarueguillaume@gmail.com': {
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