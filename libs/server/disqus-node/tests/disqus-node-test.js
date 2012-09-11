/*jshint node:true, curly:true, eqeqeq:true, onevar:true
   onevar:true */

var disqus = require('../lib/disqus-node.js'),
   dq;

dq = disqus(
   "PjBusPP4mtOe9VQDuDLe5DetbdLLLqjrhqosGnHrKS8JlBDpFrZg6yDnedBeL65E",
   'json',
   '3.0',
   false
);

dq.call('threads', 'list', {"forum": "xonecas"}, function (response) {
   console.log(response.toString());

   response.iter(function (value, key) {
      console.log("\n"+ key +": "+ value.toString()); 
   });

   console.log(response.len());

   console.log(response.getSlice(0, 1));

   console.log(response.getItem(0));

   console.log(response.contains(0));
   
});

