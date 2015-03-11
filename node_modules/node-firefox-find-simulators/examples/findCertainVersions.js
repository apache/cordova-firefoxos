'use strict';

var findSimulators = require('../.');

// Only find simulators at version 2.0
findSimulators({ version: '2.0' }).then(function(simulators) {
  console.log(simulators);
}, function(err) {
  console.error(err);
});

// Or find simulators at 2.0 and 2.1
findSimulators({ version: ['2.0', '2.1'] }).then(function(simulators) {
  console.log(simulators);
}, function(err) {
  console.error(err);
});
