'use strict';

var findPorts = require('../');

// We request to find any port, we don't care if it's a simulator or Firefox Desktop,
// but we want detailed results
findPorts({ detailed: true }).then(function(results) {
  if (results.length === 0) {
    console.log('No runtime found');
  } else {
    console.log('Found ' + results.length + ' runtimes (of any type)');
    results.forEach(logEntry);
  }
}, onError);

// Just finding ports where Firefox OS simulators are listening
findPorts({ firefoxOSSimulator: true }).then(function(results) {
  if (results.length === 0) {
    console.log('Did not find any simulator running');
  } else {
    console.log('Found ' + results.length + ' simulators');
    results.forEach(logEntry);
  }
}, onError);

function logEntry(entry, index) {
  var str = index + 1 + ') type: ' + entry.type + ' port: ' + entry.port;
  if (entry.device) {
    var device = entry.device;
    str += ' version: ' + device.version + ' gecko: ' + device.geckoversion;
  }
  console.log(str);
}

function onError(err) {
  console.log(err);
}
