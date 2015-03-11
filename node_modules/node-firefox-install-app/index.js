'use strict';

// See https://github.com/jshint/jshint/issues/1747 for context
/* global -Promise */
var Promise = require('es6-Promise').Promise;
var fs = require('fs');
var uuid = require('node-uuid');
var zipFolder = require('zip-folder');
var temporary = require('temporary');

module.exports = function(options) {

  options = options || {};

  var appPath = options.appPath;
  var client = options.client;

  return new Promise(function(resolve, reject) {

    if (appPath === undefined || client === undefined) {
      return reject(new Error('App path and client are required to install an app'));
    }

    // TODO: we can also install hosted apps using the client!
    // TODO: do we need to uninstall the app? (it's an unexpected side effect!)
    // TODO: optionally launch app

    Promise.all([ zipApp(appPath), getWebAppsActor(client) ]).then(function(results) {

      var packagedAppPath = results[0];
      var webAppsActor = results[1];
      var appId = uuid.v1();

      installApp(webAppsActor, packagedAppPath, appId).then(function(result) {
        resolve(result);
        deleteFile(packagedAppPath);
      }, function(err) {
        reject(err);
        deleteFile(packagedAppPath);
      });

    });

  });

};


function zipApp(appPath) {

  var zipPath = new temporary.File().path;

  return new Promise(function(resolve, reject) {
    zipFolder(appPath, zipPath, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(zipPath);
      }
    });
  });

}


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


function installApp(webAppsActor, packagedAppPath, appId) {
  return new Promise(function(resolve, reject) {
    webAppsActor.installPackaged(packagedAppPath, appId, function(err, actualAppId) {
      if (err) {
        return reject(err);
      }
      resolve(actualAppId);
    });
  });
}


function deleteFile(filePath) {
  fs.unlinkSync(filePath);
}

