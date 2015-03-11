'use strict';

// See https://github.com/jshint/jshint/issues/1747 for context
/* global -Promise */
var Promise = require('es6-promise').Promise;
var adb = require('adbkit');

module.exports = findDevices;

// Stolen from the ADB Helper add-on
// https://github.com/mozilla/adbhelper/blob/36559184f122f410a4e571f6217e6ed8ca4fa33e/scanner.js#L114
var B2G_TEST_COMMAND = 'test -f /system/b2g/b2g; echo $?';

function findDevices() {
  var client = adb.createClient();

  return client.listDevices().then(function(devices) {

    return Promise.all(devices.map(function(device) {

      // Test for Firefox OS on devices, annotate the device list with result.
      return client.shell(device.id, B2G_TEST_COMMAND)
        .then(adb.util.readAll)
        .then(function(output) {
          // This is counterintuitive: The command result is the exit code,
          // which is 1 for failure, which means Firefox OS was *not* detected.
          device.isFirefoxOS = (output.toString('utf8').charAt(0) === '0');
          return device;
        });

    }));

  }).then(function(devices) {

    // Filter out all but the Firefox OS devices
    return devices.filter(function(device) {
      return device.isFirefoxOS;
    });

  });
}
