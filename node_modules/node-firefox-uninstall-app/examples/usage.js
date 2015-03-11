'use strict';

var path = require('path');
var fs = require('fs');
// See https://github.com/jshint/jshint/issues/1747 for context
/* global -Promise */
var Promise = require('es6-promise').Promise;
var startSimulator = require('node-firefox-start-simulator');
var connect = require('node-firefox-connect');
var installApp = require('node-firefox-install-app');
var findApp = require('node-firefox-find-app');
var launchApp = require('node-firefox-launch-app');
var uninstallApp = require('..');

var appPath = path.join(__dirname, 'sampleApp');
var manifest = loadJSON(path.join(appPath, 'manifest.webapp'));

// This example will start a Firefox OS simulator,
// find if the sample app is already installed,
// then uninstall it,
// install it again,
// then find and launch the installed app.
// You will need to have at least a simulator
// already installed!


startSimulator().then(function(simulator) {
  connect(simulator.port).then(function(client) {
    findApp({ client: client, manifest: manifest }).then(function(apps) {
      console.log('Found', apps.length, 'apps');
      Promise.all(apps.map(function(app) {
        console.log('Uninstalling', app.manifestURL);
        return uninstallApp({ manifestURL: app.manifestURL, client: client });
      })).then(function(results) {
        console.log('Installing', appPath);
        installApp({ appPath: appPath, client: client }).then(function() {
          findApp({ client: client, manifest: manifest }).then(function(app) {
            var firstApp = app[0];
            launchApp({ client: client, manifestURL: firstApp.manifestURL }).then(function(done) {
              console.log('Launched app');
            }, function(err) {
              console.error('App could not be launched', err);
            });
          });
        });
      });
    });
  });
});


function loadJSON(path) {
  var data = fs.readFileSync(path, 'utf8');
  return JSON.parse(data);
}
