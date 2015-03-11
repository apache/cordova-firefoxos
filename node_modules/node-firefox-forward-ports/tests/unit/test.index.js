'use strict';

/* global -Promise */
var Promise = require('es6-promise').Promise;
var mockery = require('mockery');
var nodemock = require('nodemock');

var forwardPorts = require('../../index');

// nodemock expects an empty function to indicate a callback parameter
var CALLBACK_TYPE = function() {};

module.exports = {

  'forwardPorts() should yield an error if the devices option is missing': function(test) {
    forwardPorts().then(function(results) {
      test.ok(false);
      test.done();
    }).catch(function(err) {
      test.done();
    });
  },

  'forwardPorts() should yield an error if the devices option is not an array': function(test) {
    forwardPorts({
      devices: 'LOL NOT AN ARRAY'
    }).then(function(results) {
      test.ok(false);
      test.done();
    }).catch(function(err) {
      test.done();
    });
  },

  // Note: These tests are mostly identical, except for whether forwarded
  // ports already exist. In either case, whether ports are quietly reused or
  // new ones forwarded, the end result returned to the developer is the same.

  'forwardPorts({ devices: devices }) should forward a port for a device not yet forwarded':
    commonForwardTest(false, true),

  'forwardPorts({ devices: devices }) should skip forwarding for devices that have forwarded ports':
    commonForwardTest(true, true),

  'forwardPorts(devices) should forward a port for a device not yet forwarded':
    commonForwardTest(false, false),

  'forwardPorts(devices) should skip forwarding for devices that have forwarded ports':
    commonForwardTest(true, false),

  tearDown: function(done) {
    mockery.disable();
    done();
  }

};

function commonForwardTest(detectForwardedPorts, useOptions) {
  return function(test) {

    var port = 9999;
    var deviceId = '8675309';
    var localAddress = 'tcp:'+port;
    var remoteAddress = 'localfilesystem:/data/local/debugger-socket';
    var devices = [ { id: deviceId } ];

    var mocked;

    // Vary the test on whether existing forwarded ports should be detected
    if (detectForwardedPorts) {

      // Report existing port forwards for the device.
      mocked = nodemock
        .mock('listForwards')
        .returns(new Promise(function(resolve, reject) {
          resolve([

            // This is a Firefox remote debugging socket, using test values.
            {
              serial: deviceId,
              local: localAddress,
              remote: remoteAddress
            },

            // Note: This is a socket we're not interested in, so it shouldn't
            // end up in results.
            {
              serial: deviceId,
              local: 'tcp:2112',
              remote: 'localfilesystem:/data/local/some-other-socket'
            }

          ]);
        }));

      // Any call to portfinder.getPort() or client.forward() is a failure,
      // because port forwarding should be skipped.
      mocked.mock('getPort').fail();
      mocked.mock('forward').fail();

    } else {

      // Report no existing port forwards for the device.
      mocked = nodemock
        .mock('listForwards')
        .returns(new Promise(function(resolve, reject) {
          resolve([]);
        }));

      // portfinder.getPort() should be called to discover a free port.
      mocked.mock('getPort')
        .takes({ host: '127.0.0.1' }, CALLBACK_TYPE)
        .calls(1, [null, port]);

      // client.forward() should be called to create the port forward.
      mocked.mock('forward')
        .takes(deviceId, localAddress, remoteAddress)
        .returns(new Promise(function(resolve, reject) { resolve(); }));

    }

    mockery.registerMock('portfinder', {
      getPort: mocked.getPort
    });

    mocked.mock('createClient').returns({
      listForwards: mocked.listForwards,
      forward: mocked.forward
    });

    mockery.registerMock('adbkit', {
      createClient: mocked.createClient
    });

    // Enable mocks on a clear import cache
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });

    // Require a freshly imported forwardPorts for this test
    var forwardPortsWithMocks = require('../../index');

    // forwardPorts() can accept a simple device list, or a full options object.
    var forwardPortsPromise = (useOptions) ?
      forwardPortsWithMocks({ devices: devices }) :
      forwardPortsWithMocks(devices);

    forwardPortsPromise.catch(function(err) {
      test.ifError(err);
      test.done();
    }).then(function(results) {

      // Ensure all the mocks were called, and with the expected parameters
      test.ok(mocked.assert());

      // Result should be an array of one device.
      test.ok(Array.isArray(results));
      test.equal(results.length, 1);

      // The single device should list device and port details.
      var result = results[0];
      test.equal(result.id, deviceId);

      // There should only be one port - the other one should have been ignored.
      test.equal(result.ports.length, 1);
      test.deepEqual(result.ports[0], {
        port: port,
        local: localAddress,
        remote: remoteAddress
      });

      test.done();

    });

  };
}
