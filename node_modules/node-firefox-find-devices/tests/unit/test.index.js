'use strict';

/* global -Promise */
var Promise = require('es6-promise').Promise;
var mockery = require('mockery');
var nodemock = require('nodemock');

module.exports = {

  'findDevices() should enumerate ADB devices and scan for b2g installations': function(test) {

    var fxosId = '8675309';
    var androidId = 'ILIKEROBOTS';

    var mocked = nodemock
      .mock('listDevices')
      .returns(new Promise(function(resolve, reject) {
        resolve([
          { id: fxosId, type: 'device' },
          { id: androidId, type: 'device' }
        ]);
      }));

    var mockShell = function(deviceId, command) {
      return new Promise(function(resolve, reject) {
        // Note: '0' means FxOS *was* detected.
        var result = (deviceId === fxosId) ? '0' : '1';
        resolve(result + '\r\n');
      });
    };

    mocked.mock('createClient').returns({
      listDevices: mocked.listDevices,
      shell: mockShell
    });

    mockery.registerMock('adbkit', {
      createClient: mocked.createClient,
      util: {
        readAll: function(input) {
          return new Buffer(input, 'utf8');
        }
      }
    });

    // Enable mocks on a clear import cache
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });

    // Require a freshly imported findDevices for this test
    var findDevices = require('../../index');

    findDevices().catch(function(err) {
      test.ifError(err);
      test.done();
    }).then(function(results) {

      // Ensure all the mocks were called, and with the expected parameters
      test.ok(mocked.assert());

      var foundFirefoxOS = false;
      var foundAndroid = false;

      results.forEach(function(result) {
        if (result.id === fxosId) {
          foundFirefoxOS = true;
        }
        if (result.id === androidId) {
          foundAndroid = true;
        }
      });

      // Ensure we did not find the Android device
      test.ok(!foundAndroid);

      // Ensure we found the Firefox OS device
      test.ok(foundFirefoxOS);

      test.done();

    });
  }

};
