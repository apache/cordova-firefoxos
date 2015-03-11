'use strict';

var startSimulator = require('../');

// Start any simulator, in detached and verbose mode
startSimulator({
  detached: true,
  verbose: true
}).then(function(results) {
  console.log('Started simulator in detached mode, port = ' + results.port);
  console.log(results);
}, function(err) {
  console.error('Error starting simulator', err);
});

