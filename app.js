// -- Change dir to local dir
var path  = require("path");
var current_path = __dirname+'';
process.chdir(path.normalize(__dirname+'/')) ;
GLOBAL.root_path = process.cwd() ;

// -- Load Libs
var fs = require('fs'),
    util = require('util'),
    express = require('express'),
    passport = require('passport'),
    cluster = require('cluster'),
    colors = require('colors'),
    http = require('http'),
    numCPUs = require('os').cpus().length ;

// -- Load Globals
GLOBAL.mkdirp = require('mkdirp') ;
GLOBAL.jQuery = require('jquery') ;
GLOBAL.tools = require(root_path+'/libs/server/tools.kit') ;
require('datejs');

// -- Config
var config = {
    redis: {
        host: 'localhost',
        port: 6379,
        db: 1
    },
    server: {
        host: 'localhost',
        port: 10000
    },
    session: {
        cookname: 'express.sid',
        password: 'N0d3*)s3Ss10n',
        cookoptions: {
            path: '/', 
            httpOnly: true, 
            maxAge: 31*24*3600*1000
        }
    },
    env: 'dev'
}

// -- Detect Prod Env // You can customize this test
if ( (/^\/var\/www/).test(root_path) || /^\/home\/www/.test(root_path) ) {
    config.env = 'prod'
}

// -- Set number of CPUs instances
numCPUs = (config.env == 'dev') ? 1 : Math.max(2, numCPUs) ;

//////////////////////////////////////////////////////// WELCOME MESSAGE ///////////// 
var welcome = [
'',
'____    ____  ___           _______. __    __  ',
'\\   \\  /   / /   \\         /       ||  |  |  | ',
' \\   \\/   / /  ^  \\       |   (----`|  |__|  | ',
'  \\      / /  /_\\  \\       \\   \\    |   __   | ',
'   \\    / /  _____  \\  .----)   |   |  |  |  | ',
'    \\__/ /__/     \\__\\ |_______/    |__|  |__| ',
''
].join('\n');
util.puts(welcome.rainbow.bold);

///////////////////////////////////////////////////////////////////////// LOG TO FILE
var logToFile = require('logtofile'),
    logPath = path.normalize(__dirname+'/logs/'),
    logFile = config.server.host+'_'+config.server.port+'.log' ;


// -> Write message to console
tools.log('[>] Output logs to : '+logPath+logFile)

// -> Make logs dir
mkdirp.sync(logPath); 

// -> At this time, all tools.log calls will be redirected into log files
GLOBAL.logger = logToFile.create({
    directory: logPath,
    fileName: logFile
});

tools.warning(' [ ] Running environement : '+((config.env=='prod') ? 'PODUCTION' : 'DEVELOPMENT')) ;

///////////////////////////////////////////////////////////// MASTER CLUSTER /////////////
if (cluster.isMaster) {

    // Helper to fork a new instance
    function WorkerFork() {
        var worker = cluster.fork();
        worker.on('message', function(msg) {
            tools.log("[>] "+id+" | New message :: "+json(msg));
        });
    }

    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        setTimeout(function() {
            WorkerFork() ;
        }, i*30000) ;
    }

    // On exit, restart worker
    cluster.on('exit', function(worker, code, signal) {
        var exitCode = worker.process.exitCode;
        tools.warning('[*] '+worker.id+' | worker died : '+worker.process.pid+' ('+exitCode+').');
        if ( ! cluster.isExiting ) {
            tools.warning('[>] '+worker.id+' | worker restarting...');
            setTimeout(function() {
                WorkerFork() ;
            }, 500)
        }
    });

    // Message when worker is lonline
    cluster.on('online', function(worker) {
        tools.log("[>] "+worker.id+" | worker responded after it was forked");
        worker.send('Hello you !');
    });

    ///////////////////////////////////////////////////////////// PROTECT EXIT /////////////
    // Start reading from stdin so we don't exit.
    process.stdin.resume();
    process.on('SIGINT', function () {
        cluster.isExiting = true ;
        async.series({
            foo: function(callback) {
                callback(null, true)
            }
        }, function() {
            tools.log('[*] Exit as a gentleman !') ;
            process.exit(0); 
        })
    });

} 


///////////////////////////////////////////////////////////// WORKER CLUSTER /////////////
else {

    // -- Init message
    tools.log('[>] Worker is running...');

    // -- Inter processes message receiption
    process.on('message', function(msg) {
        tools.debug('[>] Master message :: '+json(msg));
    });

    ///////////////////////////////////////////////////////////// APPLICATION /////////////
    // Create API server
    var app = express()
      , server = http.createServer(app) ;

    // Register VaSH as an express middleware plugin
    express.vash = require('./libs/server/express.vash') ;

    // Add session && router support 
    app.use(express.favicon()); 
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.errorHandler());
    app.use(express.methodOverride());
   // app.use(express.csrf());

    // -- Express sessions
    var RedisStore = require('connect-redis')(express),
        sessionStore = new RedisStore,
        Session = require('connect').middleware.session.Session ;

    // -- Configure session
    app.use(express.session({
        secret: config.session.password, 
        key: config.session.cookname, 
        cookie: config.session.cookoptions, 
        store: sessionStore
    }));

    // -- Initialize passport middleware
    app.use(passport.initialize());
    app.use(passport.session());

    // -- Passport session setup
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });

    // -- Initialize VaSH middleware
    app.use(express.vash({ env: config.env, cache: 3600*1000, passport: passport }).get);

    // -- Start Server
    server.listen(config.server.port);
    tools.debug(' [*] WebServer STARTED : http://'+config.server.host+':'+config.server.port+'/') ;    

    ///////////////////////////////////////////////////////////// WEBSOCKET /////////////
    var sio = require('socket.io')
    , RedisStore = sio.RedisStore
    , io = sio.listen(server);

    // Set store
    io.set('store', new RedisStore);
    io.set('log level', 2)
    io.sockets.on('connection', function (socket) {
        socket.emit('news', { hello: 'world' });
    });

}
