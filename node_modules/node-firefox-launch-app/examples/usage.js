'use strict';

var path = require('path');
var fs = require('fs');
var startSimulator = require('node-firefox-start-simulator');
var connect = require('node-firefox-connect');
var installApp = require('node-firefox-install-app');
var findApp = require('node-firefox-find-app');
var launchApp = require('..');

var appPath = path.join(__dirname, 'sampleApp');
var manifest = loadJSON(path.join(appPath, 'manifest.webapp'));

// This example will start a Firefox OS simulator,
// install the sample app on it,
// then find and launch the installed app.
// You will need to have at least a simulator
// already installed!

startSimulator().then(function(simulator) {
  connect(simulator.port).then(function(client) {
    installApp({
      appPath: appPath,
      client: client
    }).then(function(appId) {
      console.log('App was installed with appId = ', appId);
      findApp({
        manifest: manifest,
        client: client
      }).then(function(apps) {
        if (apps.length > 0) {
          var firstApp = apps[0];
          launchApp({
            client: client,
            manifestURL: firstApp.manifestURL
          }).then(function(result) {
            console.log('Launched app', result);
          }, function(err) {
            console.error('Could not launch app', err);
          });
        }
      }, function(e) {
        console.error('Could not find app', e);
      });
    }, function(error) {
      console.error('App could not be installed: ', error);
    });
  });
});


function loadJSON(path) {
  var data = fs.readFileSync(path, 'utf8');
  return JSON.parse(data);
}
