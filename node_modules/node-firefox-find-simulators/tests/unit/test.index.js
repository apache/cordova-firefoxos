'use strict';

var path = require('path');

var home = path.join(__dirname, 'data', process.platform);
process.env.HOME = home;
process.env.USERPROFILE = home;

var findSimulators = require('../../index');
var platform = require('../../lib/platform');

module.exports = {

  'findSimulators works on current platform': function(test) {
    var currentPlatform = platform(process.platform);
    var vars = {
      PROFILEDIR: currentPlatform.firefoxProfilesDir,
      BINARY: currentPlatform.simulatorBinary
    };

    var expected = [
      { version: '1.3',
        bin: '%PROFILEDIR%/asdflulz.Release/extensions/fxos_1_3_simulator@mozilla.org/%BINARY%',
        profile: '%PROFILEDIR%/asdflulz.Release/extensions/fxos_1_3_simulator@mozilla.org/profile' },
      { version: '2.0',
        bin: '%PROFILEDIR%/asdflulz.Release/extensions/fxos_2_0_simulator@mozilla.org/%BINARY%',
        profile: '%PROFILEDIR%/asdflulz.Release/extensions/fxos_2_0_simulator@mozilla.org/profile' },
      { version: '1.4',
        bin: '%PROFILEDIR%/omgbbqya.dev-edition-default/extensions/fxos_1_4_simulator@mozilla.org/%BINARY%',
        profile: '%PROFILEDIR%/omgbbqya.dev-edition-default/extensions/fxos_1_4_simulator@mozilla.org/profile' },
      { version: '2.1',
        bin: '%PROFILEDIR%/omgbbqya.dev-edition-default/extensions/fxos_2_1_simulator@mozilla.org/%BINARY%',
        profile: '%PROFILEDIR%/omgbbqya.dev-edition-default/extensions/fxos_2_1_simulator@mozilla.org/profile' },
      { version: '1.5',
        bin: '%PROFILEDIR%/ou812wow.Nightly/extensions/fxos_1_5_simulator@mozilla.org/%BINARY%',
        profile: '%PROFILEDIR%/ou812wow.Nightly/extensions/fxos_1_5_simulator@mozilla.org/profile' },
      { version: '2.2',
        bin: '%PROFILEDIR%/ou812wow.Nightly/extensions/fxos_2_2_simulator@mozilla.org/%BINARY%',
        profile: '%PROFILEDIR%/ou812wow.Nightly/extensions/fxos_2_2_simulator@mozilla.org/profile' }
    ];

    // Replace platform-specific placeholders in the expected data
    for (var expectedIndex = 0; expectedIndex < expected.length; expectedIndex++) {
      var item = expected[expectedIndex];
      for (var itemKey in item) {
        for (var varKey in vars) {
          var computedValue;

          if (varKey === 'BINARY') {
            computedValue = vars.BINARY.call(item, item.version.replace('.', '_'), process.arch);
          } else {
            computedValue = vars[varKey];
          }

          item[itemKey] = item[itemKey].replace('%' + varKey + '%', computedValue);
        }
        if (process.platform === 'win32') {
          // HACK: Correct expected path when running tests on win32
          item[itemKey] = item[itemKey].replace(/\//g,'\\');
        }
      }
    }

    findSimulators().then(function(result) {
      // Ensure all the expected simulators are found in the result
      test.deepEqual(result, expected);
      test.done();
    });
  }

};
