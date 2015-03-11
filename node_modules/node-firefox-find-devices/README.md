# node-firefox-find-devices [![Build Status](https://secure.travis-ci.org/mozilla/node-firefox-find-devices.png?branch=master)](http://travis-ci.org/mozilla/node-firefox-find-devices)

> Find attached FirefoxOS devices using ADB.

[![Install with NPM](https://nodei.co/npm/node-firefox-find-devices.png?downloads=true&stars=true)](https://nodei.co/npm/node-firefox-find-devices/)

This is part of the [node-firefox](https://github.com/mozilla/node-firefox) project.

When Firefox OS devices are plugged in via USB, they can be found using the
Android Debug Bridge. Once found, a test for the presence of Firefox OS on the
device can separate them from normal Android devices.

## Installation

### From git

```bash
git clone https://github.com/mozilla/node-firefox-find-devices.git
cd node-firefox-find-devices
npm install
```

If you want to update later on:

```bash
cd node-firefox-find-devices
git pull origin master
npm install
```

### npm

```bash
npm install node-firefox-find-devices
```

## Usage

```javascript
findDevices() // returns a Promise
```

### Finding devices

```javascript
var findDevices = require('node-firefox-find-devices');

// Return all listening runtimes
findDevices().then(function(results) {
  console.log(results);
});
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

This program is free software; it is distributed under an
[Apache License](https://github.com/mozilla/node-firefox-find-devices/blob/master/LICENSE).

## Copyright

Copyright (c) 2015 [Mozilla](https://mozilla.org)
([Contributors](https://github.com/mozilla/node-firefox-find-devices/graphs/contributors)).
