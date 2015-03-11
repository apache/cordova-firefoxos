'use strict';

// See https://github.com/jshint/jshint/issues/1747 for context
/* global -Promise */
var Promise = require('es6-promise').Promise;

module.exports = function(options) {

  options = options || {};

  var manifestURL = options.manifestURL;
  var client = options.client;

  return new Promise(function(resolve, reject) {

    if (manifestURL === undefined || client === undefined) {
      return reject(new Error('App manifestURL and client are required to launch an app'));
    }

    getWebAppsActor(client).then(function(webAppsActor) {
      launchApp(webAppsActor, manifestURL)
        .then(function(result) {
          resolve(result);
        }, function(err) {
          reject(err);
        });
    });

  });

};


function getWebAppsActor(client) {
  return new Promise(function(resolve, reject) {

    client.getWebapps(function(err, webAppsActor) {
      if (err) {
        return reject(err);
      }
      resolve(webAppsActor);
    });

  });
}


function launchApp(webAppsActor, appManifestURL) {
  return new Promise(function(resolve, reject) {
    webAppsActor.launch(appManifestURL, function(err, response) {
      if (err) {
        return reject(err);
      }
      resolve(response);
    });
  });
}


