'use strict';

/* global -Promise */

var Promise = require('es6-promise').Promise;
var mockery = require('mockery');
var nodemock = require('nodemock');

var REMOTE_DEBUGGER_SOCKET = 'localfilesystem:/data/local/debugger-socket';

module.exports = {

  'firefoxOSDevice option should find ports forwarded to remote debugging socket on devices': function(test) {

    var port = 9999;
    var deviceId = '8675309';
    var localAddress = 'tcp:' + port;
    var remoteAddress = 'localfilesystem:/data/local/debugger-socket';

    // Report existing port forwards for the device.
    var mocked = nodemock
      .mock('listForwards')
      .returns(new Promise(function(resolve, reject) {
        resolve([
          {
            serial: deviceId,
            local: localAddress,
            remote: remoteAddress
          }
        ]);
      }));

    mocked.mock('createClient').returns({
      listForwards: mocked.listForwards
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

    // Require a freshly imported module for this test
    var findPortsWithMocks = require('../../index');

    findPortsWithMocks({ firefoxOSDevice: true }).catch(function(err) {
      test.ifError(err);
      test.done();
    }).then(function(results) {

      // Ensure all the mocks were called, and with the expected parameters
      test.ok(mocked.assert());

      test.deepEqual(results, [
        { type: 'device', port: port, deviceId: deviceId }
      ]);

      mockery.disable();

      test.done();

    });
  },

  'ignoreMultiplePortsPerDevice option should filter local ports forwarded to the same remote port': function(test) {

    var ports = [
      { serial: '8675309',   local: 'tcp:8001', remote: REMOTE_DEBUGGER_SOCKET },
      { serial: '8675309',   local: 'tcp:8002', remote: REMOTE_DEBUGGER_SOCKET },
      { serial: 'omgwtfbbq', local: 'tcp:8003', remote: REMOTE_DEBUGGER_SOCKET },
      { serial: 'omgwtfbbq', local: 'tcp:8004', remote: REMOTE_DEBUGGER_SOCKET }
    ];

    // Simplified minimal mockup of adbKit.createClient().listForwards()
    mockery.registerMock('adbkit', {
      createClient: function() {
        return {
          listForwards: function() {
            return new Promise(function(resolve, reject) {
              resolve(ports);
            });
          }
        };
      }
    });

    // Enable mocks on a clear import cache
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });

    // Require a freshly imported module for this test
    var findPortsWithMocks = require('../../index');

    Promise.all([

      // Default option, should filter multiple ports
      findPortsWithMocks({ firefoxOSDevice: true }),

      // true, same as default
      findPortsWithMocks({ firefoxOSDevice: true,
                           ignoreMultiplePortsPerDevice: true }),

      // false, should yield multiple ports per device
      findPortsWithMocks({ firefoxOSDevice: true,
                           ignoreMultiplePortsPerDevice: false })

    ]).then(function(resultSet) {

      test.deepEqual(resultSet, [
        [
          { type: 'device', port: 8001, deviceId: '8675309' },
          { type: 'device', port: 8003, deviceId: 'omgwtfbbq' }
        ],
        [
          { type: 'device', port: 8001, deviceId: '8675309' },
          { type: 'device', port: 8003, deviceId: 'omgwtfbbq' }
        ],
        [
          { type: 'device', port: 8001, deviceId: '8675309' },
          { type: 'device', port: 8002, deviceId: '8675309' },
          { type: 'device', port: 8003, deviceId: 'omgwtfbbq' },
          { type: 'device', port: 8004, deviceId: 'omgwtfbbq' }
        ]
      ]);

      mockery.disable();

      test.done();

    }).catch(function(err) {
      test.ifError(err);
      test.done();
    });
  }

};
