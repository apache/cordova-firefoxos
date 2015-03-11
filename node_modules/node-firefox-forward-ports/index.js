'use strict';

// See https://github.com/jshint/jshint/issues/1747 for context
/* global -Promise */
var Promise = require('es6-promise').Promise;
var adb = require('adbkit');
var portfinder = require('portfinder');

var REMOTE_DEBUGGER_SOCKET = 'localfilesystem:/data/local/debugger-socket';

module.exports = forwardPorts;

function forwardPorts(options) {

  var devices;

  if (Array.isArray(options)) {
    devices = options;
  } else {
    options = options || {};
    devices = options.devices;
  }

  var adbClient = adb.createClient();

  return new Promise(function(resolve, reject) {
    if (devices === undefined || !Array.isArray(devices)) {
      return reject(new Error('an array of devices is required to forward ports'));
    }
    return resolve();
  }).then(function() {
    return findExistingPortForwards(adbClient, devices);
  }).then(function(devicesWithPorts) {
    return forwardDevices(adbClient, devicesWithPorts);
  });
}

function findExistingPortForwards(adbClient, devices) {
  return adbClient.listForwards().then(function(ports) {

    // Index the list of forwarded ports by device ID.
    var portMap = {};
    ports.forEach(function(port) {

      // Filter for remote debugging sockets, just in case something else has
      // been forwarded.
      if (port.remote !== REMOTE_DEBUGGER_SOCKET) {
        return;
      }

      // Add this port to a list associated with the device ID
      if (!portMap[port.serial]) {
        portMap[port.serial] = [];
      }
      portMap[port.serial].push(port);

    });

    // Annotate the list of devices with associated ports.
    return devices.map(function(device) {
      device.ports = portMap[device.id] || [];
      return device;
    });

  });
}

function forwardDevices(adbClient, devices) {
  return Promise.all(devices.map(function(device) {

    if (device.ports.length > 0) {
      // Skip forwarding for this device. But, extract port number from the
      // tcp:{port} format returned by adbClient.listForwards()
      device.ports.forEach(function(port) {
        delete port.serial;
        if (port.local.indexOf('tcp:') === -1) {
          port.port = null;
        } else {
          port.port = port.local.replace('tcp:', '');
        }
      });
      return device;
    }

    return getPort().then(function(port) {
      var localAddress = 'tcp:' + port;
      var remoteAddress = REMOTE_DEBUGGER_SOCKET;
      return adbClient
        .forward(device.id, localAddress, remoteAddress)
        .then(function() {
          device.ports = [
            {
              port: port,
              local: localAddress,
              remote: remoteAddress
            }
          ];
          return device;
        });
    });

  }));
}

function getPort() {
  return new Promise(function(resolve, reject) {
    portfinder.getPort({
      // Ensure we're looking at localhost, rather than 0.0.0.0
      // see: https://github.com/indexzero/node-portfinder/issues/13
      host: '127.0.0.1'
    }, function(err, port) {
      return err ? reject(err) : resolve(port);
    });
  });
}
