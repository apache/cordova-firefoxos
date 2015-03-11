'use strict';

var startSimulator = require('../');

// Start a simulator in version 2.2, in verbose mode
// NOTE: if you don't have a simulator in this version installed,
// this example won't work and will print an error instead.
startSimulator({
  verbose: true,
  version: '2.2'
}).then(function(simulator) {
  console.log('simulator started', simulator);
}, function(err) {
  console.error('Error starting simulator', err);
});


