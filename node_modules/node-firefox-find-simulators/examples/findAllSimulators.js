'use strict';

var findSimulators = require('../');

findSimulators().then(function(results) {
  console.log(results);
}, function(err) {
  console.log('error', err);
});
