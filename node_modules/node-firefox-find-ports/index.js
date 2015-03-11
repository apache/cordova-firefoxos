'use strict';

// See https://github.com/jshint/jshint/issues/1747 for context
/* global -Promise */

var Promise = require('es6-promise').Promise;
var exec = require('shelljs').exec;
var FirefoxClient = require('firefox-client');
var os = process.platform;

var parsers = require('./lib/parsers');

var commands = {
  darwin: 'lsof -i -n -P -sTCP:LISTEN',
  linux: 'netstat -lnptu',
  win32: ['tasklist', 'netstat -ano']
};

var adb = require('adbkit');
var REMOTE_DEBUGGER_SOCKET = 'localfilesystem:/data/local/debugger-socket';

module.exports = findPorts;

function findPorts(opts) {
  opts = opts || {};

  var isDefaultSearch = !opts.firefox &&
                        !opts.firefoxOSSimulator &&
                        !opts.firefoxOSDevice;
  if (isDefaultSearch) {
    // By default, search for all kinds of debugging ports.
    opts.firefox = opts.firefoxOSSimulator = opts.firefoxOSDevice = true;
  }

  if (!opts.hasOwnProperty('ignoreMultiplePortsPerDevice')) {
    // By default, ignore multiple debugging ports found for the same device.
    opts.ignoreMultiplePortsPerDevice = true;
  }

  return findLocalPorts(opts).then(function(results) {
    return findForwardedPorts(opts, results);
  }).then(function(results) {
    return expandResults(opts, results);
  });
}


function findLocalPorts(opts) {
  return new Promise(function(resolve, reject) {

    var search = [];
    if (opts.firefox) {
      search.push('firefox');
    }
    if (opts.firefoxOSSimulator) {
      search.push('b2g');
    }
    if (search.length === 0) {
      return resolve([]);
    }

    var command = commands[os];
    var parser = parsers[os];

    if (parser === undefined) {
      return reject(new Error(os + ' not supported yet'));
    }

    var lines = Array.isArray(command) ?
                command.map(execAndSplitLines) :
                execAndSplitLines(command);

    var results = parser(lines, search);

    return resolve(results);

  });
}


function findForwardedPorts(opts, results) {

  if (!opts.firefoxOSDevice) {
    return results;
  }

  return adb.createClient().listForwards().then(function(ports) {

    var seenDevices = {};

    var deviceResults = ports.filter(function(port) {

      // Filter out multiple ports per device when necessary.
      if (opts.ignoreMultiplePortsPerDevice) {
        var seenKey = port.serial;
        if (opts.ignoreMultiplePortsPerDevice && seenKey in seenDevices) {
          return false;
        }
        seenDevices[seenKey] = true;
      }

      // We only want local TCP/IP ports forwarded to remote debugging sockets.
      return port.remote === REMOTE_DEBUGGER_SOCKET &&
             port.local.indexOf('tcp:') === 0;

    }).map(function(port) {

      // Extract the port number from tcp:{port}
      var portNumber = parseInt(port.local.substr(4));

      return {
        type: 'device',
        port: portNumber,
        deviceId: port.serial
      };

    });

    return results.concat(deviceResults);

  });

}


function expandResults(opts, results) {

  if (opts.release && opts.release.length > 0) {
    opts.detailed = true;
  }

  if (!opts.detailed) {
    return results;
  }

  return Promise.all(results.map(getDeviceInfo))
    .then(function(detailedResults) {
      return filterByRelease(detailedResults, opts.release);
    });
}


function execAndSplitLines(command) {
  return exec(command, { silent: true }).output.split('\n');
}


function getDeviceInfo(instance) {

  return new Promise(function(resolve, reject) {

    var client = new FirefoxClient();

    client.connect(instance.port, function(err) {

      if (err) {
        return reject(err);
      }

      client.getDevice(function(err, device) {

        if (err) {
          return reject(err);
        }

        device.getDescription(function(err, deviceDescription) {

          if (err) {
            return reject(err);
          }

          instance.device = deviceDescription;
          instance.release = deviceDescription.version;
          client.disconnect();
          resolve(instance);

        });

      });

    });

  });

}


function filterByRelease(results, release) {

  if (!release) {
    return results;
  }

  if (typeof release === 'string') {
    release = [ release ];
  }

  return results.filter(function(result) {
    var regex = new RegExp('^(' + release.join('|') + ')');
    return regex.exec(result.device.version);
  });

}
