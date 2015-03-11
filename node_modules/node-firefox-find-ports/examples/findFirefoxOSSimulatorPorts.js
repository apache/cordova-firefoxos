'use strict';

var discoverPorts = require('../index.js');

discoverPorts({ b2g: true }).then(function(simulators) {

  var ports = simulators.map(function(simulator) {
    return simulator.port;
  });

  console.log(ports);
  
});
