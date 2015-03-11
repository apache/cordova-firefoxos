'use strict';

// See https://github.com/jshint/jshint/issues/1747 for context
/* global -Promise */
var Promise = require('es6-promise').Promise;
var fs = require('fs');
var path = require('path');

module.exports = findSimulators;

var currentPlatform = require('./lib/platform')(process.platform);


function isDir(dirPath) {
  var stat = fs.statSync(dirPath);
  return stat.isDirectory();
}


function extensionDir(profileDir) {
  return path.join(profileDir, 'extensions');
}


function hasExtensions(profileDir) {
  var extensionsDir = extensionDir(profileDir);
  return fs.existsSync(extensionsDir);
}


function listExtensions(profileDir) {
  var extensionsDir = extensionDir(profileDir);
  var directories = listDirectories(extensionsDir);
  return directories;
}


function listDirectories(directoryPath) {
  var dirContents = fs.readdirSync(directoryPath);

  return dirContents.map(function(entry) {
    return path.join(directoryPath, entry);
  }).filter(isDir);
}


function flatten(arrays) {
  if (arrays.length === 0) {
    return [];
  } else {
    var firstElement = arrays[0];
    var restOfArrays = arrays.slice(1);
    return firstElement.concat(flatten(restOfArrays));
  }
}


function getSimulatorInfo(extensionDir) {
  var binaryDir = currentPlatform.simulatorBinary;
  var simulatorRegex = /fxos_(.*)_simulator@mozilla\.org$/;
  var matches = simulatorRegex.exec(extensionDir);
  if (matches && matches[1]) {
    binaryDir = currentPlatform.simulatorBinary(matches[1], process.arch);
    var version = matches[1].replace('_', '.');
    return {
      version: version,
      bin: path.join(extensionDir, binaryDir),
      profile: path.join(extensionDir, 'profile')
    };
  } else {
    return null;
  }
}


function findSimulators(options) {

  options = options || {};

  var simulators = [];
  var profilesDir = currentPlatform.firefoxProfilesDir;
  var profileFolders = listDirectories(profilesDir);
  var profilesWithExtensions = profileFolders.filter(hasExtensions);

  // per profile -> get extensions, then filter to only simulator extensions
  var extensionsPerProfile = profilesWithExtensions.map(listExtensions);
  var extensions = flatten(extensionsPerProfile);
  var extensionsWithInfo = extensions.map(getSimulatorInfo);
  simulators = extensionsWithInfo.filter(function(info) {
    return info !== null;
  });

  if (options.version) {
    var version = options.version;
    if (version instanceof String) {
      version = [ version ];
    }
    simulators = simulators.filter(function(sim) {
      return version.indexOf(sim.version) !== -1;
    });
  }

  return new Promise(function(resolve, reject) {
    resolve(simulators);
  });

}
