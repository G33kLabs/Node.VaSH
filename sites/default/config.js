module.exports =  {
	public: '/public/',
    website: 'http://www.js2node.com/',
    title: "JS> Node",
    page_title_sufix: " | G33K",
    desc: "A developer blog about js, node.js and other modern tools",
    language: 'en-EN',
    brand: "JS> Node",
    menus: [
        {
            name: 'Home',
            active: true,
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
            name: 'Contact'
        }
    ],
    routes: {
        post: '/post/:post_name'
    },
    author: 'delarueguillaume@gmail.com',
    authors: {
        'delarueguillaume@gmail.com': {
            pseudo: 'G33K',
            name: 'Guillaume DE LA RUE',
            gplus: 'https://plus.google.com/115555146160120072472/posts'
        }
    },
    copyright: ">&copy; G33K Labs | 2012"
}