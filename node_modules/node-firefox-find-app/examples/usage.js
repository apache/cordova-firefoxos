'use strict';

var fs = require('fs');
var path = require('path');
var findApp = require('../index.js');
var startSimulator = require('node-firefox-start-simulator');
var connect = require('node-firefox-connect');

var manifest = loadJSON(path.join(__dirname, 'data/manifest.webapp'));

startSimulator().then(function(simulator) {

  connect(simulator.port).then(function(client) {

    findApp({
      manifest: manifest,
      client: client
    }).then(function(result) {

      if (result.length === 0) {
        console.log('App is not installed');
      } else {
        console.log('Found app!', result);
      }

      client.disconnect();
      stopSimulator(simulator);

    });

  });

});


function loadJSON(path) {
  var data = fs.readFileSync(path, 'utf8');
  return JSON.parse(data);
}


function stopSimulator(simulator) {
  process.kill(simulator.pid);
}

