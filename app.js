// -- Change dir to local dir
var path  = require("path");
var current_path = __dirname+'';
process.chdir(path.normalize(__dirname+'/')) ;
GLOBAL.root_path = __dirname = process.cwd() ;

// -- Load Libs
var fs = require('fs'),
    util = require('util'),
    express = require('express'),
    cluster = require('cluster'),
    http = require('http'),
    numCPUs = require('os').cpus().length ;

// -- Load Globals
//GLOBAL.jQuery = require('jQuery') ;
GLOBAL.tools = require(__dirname+'/libs/server/tools.kit') ;
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
    }
}


///////////////////////////////////////////////////////////// MASTER CLUSTER /////////////
if (cluster.isMaster) {

    // Helper to fork a new instance
    function WorkerFork() {
        var worker = cluster.fork();
        worker.on('message', function(msg) {
            tools.log(" [>] "+id+" | New message :: "+json(msg));
        });
    }

    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        setTimeout(function() {
            WorkerFork() ;
        }, i*0) ;
    }

    // On exit, restart worker
    cluster.on('exit', function(worker, code, signal) {
        var exitCode = worker.process.exitCode;
        tools.warning(' [*] '+worker.process.pid+' | worker died ('+exitCode+').');
        if ( ! cluster.isExiting ) {
            tools.warning(' [>] '+worker.process.pid+' | worker restarting...');
            setTimeout(function() {
                WorkerFork() ;
            }, 500)
        }
    });

    // Message when worker is lonline
    cluster.on('online', function(worker) {
        tools.log(" [>] "+worker.id+" | worker responded after it was forked");
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
            tools.log(' [*] Exit as a gentleman !') ;
            process.exit(0); 
        })
    });

} 


///////////////////////////////////////////////////////////// WORKER CLUSTER /////////////
else {

    // -- Init message
    tools.log(' [>] '+cluster.worker.id+' | Worker is running...');

    // -- Inter processes message receiption
    process.on('message', function(msg) {
        tools.debug(' [>] '+cluster.worker.id+' | Master message :: '+json(msg));
    });

    ///////////////////////////////////////////////////////////// APPLICATION /////////////
    // Create API server
    var app = express()
      , server = http.createServer(app) ;


    // Register CMS as an express middleware plugin
    express.vash = require('./libs/server/express.vash') ;
    //  , opts = require('./config').defaults ;

    // Add session && router support 
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.errorHandler());
    app.use(express.methodOverride());
    app.use(express.favicon());  
    app.use(express.vash());

    /*
    app.use(express.static(current_path + opts.public )) ;

    // -- Prepare config options
    _.each(opts, function(val, key) {
        if ( key == 'menus') {
            _.each(val, function(v,k) {
                if ( v.active ) v.active = 'active' ;
                if ( ! v.url ) v.url = '/'+(v.name||'').toLowerCase()+'/'; 
                val[k] = v ;
            })
        }
        opts[key] = val ;
    })

    // Extend opts 
    _.extend(opts, {
        public_path: current_path + opts.public
    }); 

    // -- Serve home path
    app.get('/', function(req, res, next) {
        var _opts = _.extend({}, opts, {
            version: Date.now()
        }); 
        util.pump(mu.compileAndRender(opts.public_path+'index.html', _opts), res);
    }) ;  

    // -- Load objects
    var Objects = {
        post: require('./Models/model.post').shared
    } ;

    // -- Bind CMS Routes
    _.each(Objects, function(mod) {
        app.get(mod.route, function(req, res, next) {

            // Parse url params
            var params = {} ; for ( var i in req.params ) params[i] = req.params[i] ;

            // Create object
            var Obj = new mod(params) ;

            // Async treatment
            async.series([
                function(callback) {
                    callback(null, true)
                },
                function(callback) {
                    callback(null, true)
                }
            ], 

            // Compile template with view and display html
            function(err, success) {
                var _opts = _.extend({}, opts, {
                    page: Obj.toJSON()
                }) ;
                var tplFile = opts.public_path+(_opts.page.template?_opts.page.template:'index.html') ;
                util.pump(mu.compileAndRender(tplFile, _opts), res);
            })

        }) ;      
    })

    // -- Serve admin
    var private_path = current_path + opts.private;
    app.get('/admin/*', function(req, res, next) {
        var _opts = _.extend({}, opts, {
            version: Date.now(),
            title: 'Admin | '+opts.title,
            brand: 'Admin | '+opts.brand
        }); 
        util.pump(mu.compileAndRender(private_path+'index.html', _opts), res);
    }) ;  

    // -- Survey changes on home page to clear cache
    watch.createMonitor(opts.public_path, function (monitor) {
        monitor.on("created", function (f, stat) {
            tools.debug(' [*] '+(cluster.isMaster?'M':cluster.worker.id)+' | '+json(stat)+' | '+json(f));
        })
        monitor.on("changed", function (f, curr, prev) {
            tools.warning(' [*] '+(cluster.isMaster?'M':cluster.worker.id)+' | Mustache JS cache cleared !');
            mu.clearCache();
        })
        monitor.on("removed", function (f, stat) {
            tools.debug(' [*] '+(cluster.isMaster?'M':cluster.worker.id)+' | '+json(stat)+' | '+json(f));
        })
    } ) 


*/

    // -- Start Server
    server.listen(config.server.port);
    tools.debug(' [*] '+(cluster.isMaster?'M':cluster.worker.id)+' | WebServer STARTED : http://'+config.server.host+':'+config.server.port+'/') ;    

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
