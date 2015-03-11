'use strict';

var path = require('path');

module.exports = getConstants;

var firefoxProfilesDir = {
  darwin: 'Library/Application Support/Firefox/Profiles',
  linux: '.mozilla/firefox',
  win32: 'AppData\\Roaming\\Mozilla\\Firefox\\Profiles'
};

var simulatorBinary = {
  darwin: function(version) {
    var basePath = 'B2G.app/Contents/MacOS/b2g-bin';
    var pathPrefix = getPathPrefix(version);

    if (pathPrefix) {
      basePath = pathPrefix + 'mac64/' + basePath;
    } else {
      basePath = 'b2g/' + basePath;
    }

    return basePath;
  },
  linux: function(version, arch) {
    var basePath = 'b2g/b2g-bin';
    var pathPrefix = getPathPrefix(version);

    if (pathPrefix) {
      var archPath = (arch.indexOf('64') !== -1) ? 'linux64/' : 'linux/';
      basePath = pathPrefix + archPath + basePath;
    }

    return basePath;
  },
  win32: function(version) {
    return 'b2g\\b2g-bin.exe';
  }
};


function getPathPrefix(version) {
  if (version === '1_2' || version === '1_3') {
    return 'resources/fxos_' + version + '_simulator/data/';
  } else {
    return false;
  }
}


function getHomeDir(platform) {
  var homeEnvVar;

  if (platform === 'win32') {
    homeEnvVar = 'USERPROFILE';
  } else {
    homeEnvVar = 'HOME';
  }

  return process.env[homeEnvVar];
}


function getFirefoxProfilesDir(platform) {
  var home = getHomeDir(platform);
  return path.join(home, firefoxProfilesDir[platform]);
}


function getSimulatorBinary(platform) {
  return simulatorBinary[platform];
}


function getConstants(platform) {
  return {
    firefoxProfilesDir: getFirefoxProfilesDir(platform),
    simulatorBinary: getSimulatorBinary(platform)
  };
}
