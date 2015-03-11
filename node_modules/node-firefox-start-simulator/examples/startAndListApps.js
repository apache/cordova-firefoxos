'use strict';

var startSimulator = require('../index');
var FirefoxClient = require('firefox-client');

startSimulator({ port: 8002 }).then(function(simulator) {

  var client = new FirefoxClient();
  client.connect(simulator.port, function(err, result) {

    // Wait one second for the simulator to finish launching its apps
    setTimeout(function() {

      // And then list them!
      client.getWebapps(function(err, webapps) {
        webapps.listRunningApps(function(err, apps) {
          console.log('Running apps:', apps);
          client.disconnect();
          process.kill(simulator.pid);
        });
      });
      
    }, 1000);
 
  });

}, function(err) {
  console.error('Error starting simulator', err);
});
