'use strict';

var path = require('path');
var startSimulator = require('node-firefox-start-simulator');
var connect = require('node-firefox-connect');
var installApp = require('..');
var appPath = path.join(__dirname, 'sampleApp');

// This example will start a Firefox OS simulator
// and install the sample app on it
// You will need to have at least a simulator
// already installed!

startSimulator().then(function(simulator) {
  connect(simulator.port).then(function(client) {
    installApp({
      appPath: appPath,
      client: client
    }).then(function(appId) {
      console.log('App was installed with appId = ', appId);
    }, function(error) {
      console.error('App could not be installed: ', error);
    });
  });
});
