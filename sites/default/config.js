module.exports =  {
    website: 'http://www.js2node.com',
    local: 'http://local.js2node.com:10000',
    aliases: ['local.js2node.com', 'www.js2node.com', 'localhost'],
    title: "JS> Node",
    title_sufix: " | G33K",
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
            }
        },
        twitter: {
            infos: {
                consumerKey: 'rSW4OeSUcn33NeaID6Lw',
                consumerSecret: 'PuaP4Gh4esCLtlACJVLfdpMh3zA6UUVrSeR9saRmk18'
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
            city: 'Paris / France',
            social: [
                {
                    provider: 'Twitter',
                    pseudo: '@html5place',
                    profile: 'https://twitter.com/html5place',
                    classname: 'color_fluoblue'
                },
                {
                    provider: 'Github',
                    pseudo: '@G33kLabs',
                    profile: 'https://github.com/G33kLabs',
                    classname: 'color_greenlight'
                },
                {
                    provider: 'Google+',
                    id: '115555146160120072472',
                    pseudo: '@G33k',
                    profile: 'https://plus.google.com/115555146160120072472/',
                    classname: 'color_yellow'
                }
            ]
        }
    },
    copyright: "&copy; G33K Labs | 2012"
}