module.exports =  {
	public: '/public/',
    website: 'http://local.js2node.com:10000',
    title: "JS> Node",
    page_title_sufix: " | G33K",
    desc: "A developer blog about js, node.js and other modern tools",
    language: 'en-EN',
    brand: "JS> Node",
    menus: [
        {
            name: 'Home',
            icon: 'home',
            url: '/'
        },
        {
            name: 'Node.js'
        },
        {
            name: 'jQuery'
        },
        {
            name: 'Redis.io'
        },
        {
            name: 'Contact'
        }
    ],
    widgets: [
        {
            name: 'Recent Comments'
        },
        {
            name: 'Most Viewed Posts'
        },
        {
            name: 'My favourite Blogs'
        },
        {
            name: 'Archive'
        }
    ],
    providers: {
        facebook: {
            infos: {
                clientID: '237318836391590',
                clientSecret: '68756c699154a542735bff3ac8b2edc9'
            },
            opts: {
                perms: {scope: 'email'}
            },
            domain: 'local.js2node.com'
        },
        twitter: {
            infos: {
                consumerKey: 'rSW4OeSUcn33NeaID6Lw',
                consumerSecret: 'PuaP4Gh4esCLtlACJVLfdpMh3zA6UUVrSeR9saRmk18'
            } 
        }
    },
    author: 'delarueguillaume@gmail.com',
    authors: {
        'delarueguillaume@gmail.com': {
            pseudo: 'G33K',
            name: 'Guillaume DE LA RUE',
            city: 'Paris / France',
            gplus: 'https://plus.google.com/115555146160120072472/posts'
        }
    },
    copyright: ">&copy; G33K Labs | 2012"
}