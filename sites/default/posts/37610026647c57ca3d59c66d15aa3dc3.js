{
    "id": "37610026647c57ca3d59c66d15aa3dc3",
    "created": 1346493240000,
    "title": "Node.js can replace WordPress !",
    "desc": "How to build a multiblog platform with Node.VaSH ?",
    "raw": "### Hey ! ###\n\nWelcome to my new blog talking about **[node.js](/node-js/ \"View all Node.js articles\")**, **[jQuery](/jquery/ \"View all jQuery articles\")** and **new web technologies** around this community.\n\nFor the occasion, I wanted to test if it was possible easily to replace wordpress by a self made blog engine, or as others say *CMS*, with a node.js engine : **[Node.VaSH](https://github.com/G33kLabs/Node.VaSH \"Fork Node.VaSH on GitHub\")**.\n\n### What is Node.VaSH ###\n\n*You have a dedicated server and want to try one of the most faster blog in the world ? Try it :)*\n\nVaSh is a content manager aka a blog engine powered by **[node.js](http://nodejs.org/ \"View Node.js Website\")** and **[Redis](http://redis.io/ \"View Redis Website\")**.\nAll is driven by memory cache (static content + database) so it's really really... really fast !\n\nIncluding a **cluster architecture**, VaSh is also **highly scalable** and can host **multi blogs**.\nAs well as others blogs, it includes templates, widgets, internationalization, and auto translate features.\n\nFinally, it offers **Single Sign On** login system to help users to log them with auth providers (facebook, google, yahoo, openid, twitter, linkedin...)\nOnce connected, users can publish comments, talk...\n\n### Features ###\n\n- Scalable\n- Load balancing\n- Very very fast\n- Multi platform\n- Templates\n- Widgets (twitter, analytics...)\n- SSO (Login with facebook, twitter, google...)\n- Comments\n- Live chat\n- Internationalization\n- Auto translate\n\n### Requirements ###\n\n``` bash\nInstall Redis...\nVisit url ==> http://redis.io/download\n\nInstall Node.js...\nVisit url ==> http://node.js\n```\n\n### Installation ###\n\n``` bash\n$ echo \"[>] Install Node.VaSH...\"\n$ npm install express.vash\n```\n\n### Get Started ###\n\n``` js\n// -- Load Libs\nvar express = require('express'),\n\tapp = express(),\n\thttp = require('http'),\n    server = http.createServer(app) ;\n\n// -- Add vash to express\nexpress.vash = require('express.vash') ;\n\n// -- Add as middleware\napp.use(express.vash());\n```\n\n### Project Tree ###",
    "tags": [
        "Node.js",
        "WordPress"
    ],
    "author": "delarueguillaume@gmail.com",
    "disabled": "no",
    "updated": 1347511365137
}