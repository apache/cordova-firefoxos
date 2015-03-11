'use strict';

var platform = require('../../lib/platform');

module.exports = {

  setUp: function(next) {
    this.oldHOME = process.env.HOME;
    this.oldUSERPROFILE = process.env.USERPROFILE;
    process.env.HOME = '/home/testuser';
    process.env.USERPROFILE = 'C:\\Users\\testuser';
    next();
  },

  tearDown: function(next) {
    process.env.HOME = this.oldHOME;
    process.env.USERPROFILE = this.oldUSERPROFILE;
    next();
  },

  'darwin': function(test) {
    testPlatformPaths(test, platform('darwin'), {
      firefoxProfilesDir: '/home/testuser/Library/Application Support/Firefox/Profiles'
    });
    test.done();
  },

  'linux': function(test) {
    testPlatformPaths(test, platform('linux'), {
      firefoxProfilesDir: '/home/testuser/.mozilla/firefox'
    });
    test.done();
  },

  'win32': function(test) {
    testPlatformPaths(test, platform('win32'), {
      // HACK: On posix platforms, path.join results in this
      firefoxProfilesDir: 'C:\\Users\\testuser/AppData\\Roaming\\Mozilla\\Firefox\\Profiles'
    });
    test.done();
  }

};

function testPlatformPaths(test, result, expected) {
  test.expect(2);
  if (process.platform === 'win32') {
    // HACK: Correct expected path when running tests on win32
    expected.firefoxProfilesDir = expected.firefoxProfilesDir.replace(/\//g,'\\');
  }

  test.ok(result.simulatorBinary && typeof result.simulatorBinary === 'function');
  test.equal(result.firefoxProfilesDir, expected.firefoxProfilesDir);
}
