# node-firefox-find-ports [![Build Status](https://secure.travis-ci.org/mozilla/node-firefox-find-ports.png?branch=master)](http://travis-ci.org/mozilla/node-firefox-find-ports)

> Find ports where debuggable runtimes are listening.

[![Install with NPM](https://nodei.co/npm/node-firefox-find-ports.png?downloads=true&stars=true)](https://nodei.co/npm/node-firefox-find-ports/)

This is part of the [node-firefox](https://github.com/mozilla/node-firefox) project.

When runtimes have remote debugging enabled, they start a server that listens
for incoming connections. Devices connected via USB can also have their remote
debugging sockets forwarded to local TCP/IP ports by the Android Debug Bridge
(adb). 
  
This module can find these runtimes and in which port they are listening.

## Installation

### From git

```bash
git clone https://github.com/mozilla/node-firefox-find-ports.git
cd node-firefox-find-ports
npm install
```

If you want to update later on:

```bash
cd node-firefox-find-ports
git pull origin master
npm install
```

### npm

```bash
npm install node-firefox-find-ports
```

## Usage

```javascript
findPorts(options) // returns a Promise
```

where `options` is a plain Object with any of the following:

* `firefox`: look for Firefox Desktop instances
* `firefoxOSSimulator`: look for Firefox OS Simulators
* `firefoxOSDevice`: look for local ports forwarded to connected devices
* `ignoreMultiplePortsPerDevice`: if there are multiple local ports forwarded to the same remote debugging port on a device, report only the first that is found (default: `true`)
* `detailed`: query each found runtime for more information, such as the version, build time, processor, etc. The additional data will be added to the entry under a new `device` field.

If no `options` are provided, or if `options` is an empty `Object` (`{}`), then `findPorts` will look for any runtimes, of any type.

### Finding ports

```javascript
var findPorts = require('node-firefox-find-ports');

// Return all listening runtimes
findPorts().then(function(results) {
  console.log(results);
});

// Returns only Firefox OS simulators, this time with error handling
findPorts({ firefoxOSSimulator: true }).then(function(results) {
  console.log(results);
}, function(err) {
  console.log(err);
});
```

The output from the above code might look like the following:
```javascript
[ { type: 'b2g', port: 56567, pid: 45876 },
  { type: 'firefox', port: 6000, pid: 3718 },
  { type: 'device', port: 8001, deviceId: '3739ced5' } ]
```

Use the `detailed` option for additional information:
```javascript
// Returns only Firefox OS simulators, with extra detailed output
findPorts({
  firefoxOSSimulator: true, 
  firefoxOSDevice: true,
  detailed: true
}).then(function(results) {
  console.log(results);
});
```

Detailed output includes a lot more info:
```javascript
[ { type: 'b2g',
    port: 56567,
    pid: 45876,
    device:
     { appid: '{3c2e2abc-06d4-11e1-ac3b-374f68613e61}',
       apptype: 'b2g',
       vendor: 'Mozilla',
       name: 'B2G',
       version: '2.2.0.0-prerelease',
       appbuildid: '20141123160201',
       platformbuildid: '20141123160201',
       platformversion: '36.0a1',
       geckobuildid: '20141123160201',
       geckoversion: '36.0a1',
       changeset: '8c02f3280d0c',
       useragent: 'Mozilla/5.0 (Mobile; rv:36.0) Gecko/20100101 Firefox/36.0',
       locale: 'en-US',
       os: 'B2G',
       hardware: null,
       processor: 'x86_64',
       compiler: 'gcc3',
       dpi: 258,
       brandName: null,
       channel: 'default',
       profile: 'profile',
       width: 1680,
       height: 1050 },
    release: '2.2.0.0-prerelease' },
  { type: 'device',
    port: 8001,
    deviceId: '3739ced5',
    device:
     { appid: '{3c2e2abc-06d4-11e1-ac3b-374f68613e61}',
       apptype: 'b2g',
       vendor: 'Mozilla',
       name: 'B2G',
       version: '3.0.0.0-prerelease',
       appbuildid: '20150320064705',
       platformbuildid: '20150320064705',
       platformversion: '39.0a1',
       geckobuildid: '20150320064705',
       geckoversion: '39.0a1',
       changeset: 'b2e71f32548f',
       locale: 'en-US',
       os: 'B2G',
       hardware: 'qcom',
       processor: 'arm',
       compiler: 'eabi',
       brandName: null,
       channel: 'nightly',
       profile: 'default',
       dpi: 254,
       useragent: 'Mozilla/5.0 (Mobile; rv:39.0) Gecko/39.0 Firefox/39.0',
       width: 320,
       height: 569 },
    release: '3.0.0.0-prerelease' } ]
```

## Running the tests

After installing, you can simply run the following from the module folder:

```bash
npm test
```

To add a new unit test file, create a new file in the `tests/unit` folder. Any file that matches `test.*.js` will be run as a test by the appropriate test runner, based on the folder location.

We use `gulp` behind the scenes to run the test; if you don't have it installed globally you can use `npm gulp` from inside the project's root folder to run `gulp`.

### Code quality and style

Because we have multiple contributors working on our projects, we value consistent code styles. It makes it easier to read code written by many people! :-)

Our tests include unit tests as well as code quality ("linting") tests that make sure our test pass a style guide and [JSHint](http://jshint.com/). Instead of submitting code with the wrong indentation or a different style, run the tests and you will be told where your code quality/style differs from ours and instructions on how to fix it.

## History

This is based on initial work on [fx-ports](https://github.com/nicola/fx-ports) by Nicola Greco.

The command line utility binary has been removed for this initial iteration, since pretty much all the existing applications using this module were just using the JS code directly, not the binary.

## License

This program is free software; it is distributed under an
[Apache License](https://github.com/mozilla/node-firefox-find-ports/blob/master/LICENSE).

## Copyright

Copyright (c) 2014 [Mozilla](https://mozilla.org)
([Contributors](https://github.com/mozilla/node-firefox-find-ports/graphs/contributors)).
