var http = require('http');
var options = {
    host: 'localhost',
    port: 10000,
    method:"GET",
    path: 'http://localhost/'
};

setInterval(function() {
	console.log("\n[>] POOL !!")
	http.get(options, function(res) {
	    res.pipe(process.stdout);
	}).on('error', function(e) {
    	console.log("Got error: " + e.message);
	});
}, 5000) ;
