'use strict';

var nodemock = require('nodemock');

var launchApp = require('../../index');

module.exports = {

  'launchApp() should fail when missing client option': function(test) {
    launchApp({
      manifestURL: '...'
    }).then(function(results) {
      test.ok(false);
      test.done();
    }).catch(function(err) {
      test.done();
    });
  },

  'launchApp() should fail when missing manifestURL option': function(test) {
    launchApp({
      client: {}
    }).then(function(results) {
      test.ok(false);
      test.done();
    }).catch(function(err) {
      test.done();
    });
  },

  'launchApp() should launch a given app': function(test) {

    var MANIFEST_URL = 'app://8675309/manifest.webapp';
    var LAUNCH_RESPONSE = 'expected result';

    var mocked = nodemock
      .mock('launch')
        .takes(MANIFEST_URL, function() {})
        .calls(1, [null, LAUNCH_RESPONSE]);

    var mockClient = {
      getWebapps: function(webappsCallback) {
        webappsCallback(null, { launch: mocked.launch });
      }
    };

    launchApp({
      client: mockClient,
      manifestURL: MANIFEST_URL
    }).then(function(result) {
      test.ok(mocked.assert());
      test.equal(result, LAUNCH_RESPONSE);
      test.done();
    }).catch(function(err) {
      test.ifError(err);
      test.done();
    });

  }

};
