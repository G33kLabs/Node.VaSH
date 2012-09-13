{
    "id": "37610026907c57ca3d59c66d15aa3de9",
    "created": 1346680860000,
    "title": "Install Redis.io 2.4.17 on Mac OSX as service",
    "desc": "How to install Redis.io on your Mac ?",
    "raw": "Redis.io is a memory key DataStore which starts to be used in a lot of node projects.\n\nAs I'd some difficulties to install it from tutorial I found, here's mine, fresh and I hope complete :)\n\n### Requirements ###\n- [Xcode Command Line Tools](https://developer.apple.com/xcode/ \"You must be logged to download tools.\")\n\n### Installation ###\n``` bash\n$ cd ~\n$ wget http://redis.googlecode.com/files/redis-2.4.17.tar.gz\n$ tar xzf redis-2.4.17.tar.gz\n$ cd redis-2.4.17\n$ make\n$ sudo make install\n```\n\n### Prepare Service ###\n\nYou can edit config before to change port or assign a password\n``` bash\n// Copy config to usr local path\n$ cat redis.conf > /usr/local/etc/redis.conf\n```\n\nEdit Service plist\n``` bash  \n$ sudo vi /Library/LaunchDaemons/io.redis.redis-server.plist  \n```\n\nPut that in plist file \n``` xml\n<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">\n<plist version=\"1.0\">\n<dict>\n        <key>Label</key>\n        <string>io.redis.redis-server</string>\n        <key>ProgramArguments</key>\n        <array>\n                <string>/usr/local/bin/redis-server</string>\n                <string>/usr/local/etc/redis.conf</string>\n        </array>\n        <key>RunAtLoad</key>\n        <true></true>\n</dict>\n</plist>\n```\n\n### Register as service ###\n``` bash\n$ sudo launchctl load /Library/LaunchDaemons/io.redis.redis-server.plist\n```\n(Service will now run at each start)\n\n### Start service ###\n``` bash\n$ sudo launchctl start io.redis.redis-server\n```\n\n### Stop service ###\n``` bash\n$ sudo launchctl stop io.redis.redis-server\n```",
    "tags": [
        "Redis.io",
        "Mac OSX",
        "Install",
        "Node.js"
    ],
    "thumb": "/37610026907c57ca3d59c66d15aa3de9/thumb",
    "author": "delarueguillaume@gmail.com",
    "disabled": "no",
    "updated": 1347510495881
}