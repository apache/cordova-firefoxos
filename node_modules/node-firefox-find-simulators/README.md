# node-firefox-find-simulators [![Build Status](https://secure.travis-ci.org/mozilla/node-firefox-find-simulators.png?branch=master)](http://travis-ci.org/mozilla/node-firefox-find-simulators)

> Find installed Firefox OS simulators.

[![Install with NPM](https://nodei.co/npm/node-firefox-find-simulators.png?downloads=true&stars=true)](https://nodei.co/npm/node-firefox-find-simulators/)

This is part of the [node-firefox](https://github.com/mozilla/node-firefox) project.

## Current limitations

We do not support Windows yet. But there are placeholders in the code marked with `TODO: Windows` that indicate where the Windows code would need to be added. If you want to contribute, those are the *gaps* that need to be filled in order for this to work on Windows.

**NOTE**

*This is a work in progress. Things will probably be missing and broken while we move from `fxos-simulators` to `node-firefox-find-simulators`. Please have a look at the [existing issues](https://github.com/mozilla/node-firefox-find-simulators/issues), and/or [file more](https://github.com/mozilla/node-firefox-find-simulators/issues/new) if you find any! :-)*

## Installation

### From git

```bash
git clone https://github.com/mozilla/node-firefox-find-simulators.git
cd node-firefox-find-simulators
npm install
```

If you want to update later on:

```bash
cd node-firefox-find-simulators
git pull origin master
npm install
```

### npm

```bash
npm install node-firefox-find-simulators
```

## Usage

```javascript
findSimulators(options) // returns a Promise
```

where `options` is a plain Object with any of the following:

* `version`: only return simulators if their version matches this

If no `options` are provided, or if `options` is an empty `Object` (`{}`), then `findSimulators` will return all installed simulators.

### Finding simulators

```javascript
var findSimulators = require('node-firefox-find-simulators');

// Return all installed simulators
findSimulators().then(function(results) {
  console.log(results);
});

// Returns all installed simulators, this time with error handling
findSimulators().then(function(results) {
  console.log(results);
}, function(err) {
  console.log(err);
});

// Returns only v2.1 simulators
findSimulators({ version: '2.1' }).then(function(results) {
  console.log(results);
});

// Returns only v2.1 or v2.2 simulators
findSimulators({ version: ['2.1', '2.2'] }).then(function(results) {
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

## History

This is based on initial work on [fxos-simulators](https://github.com/nicola/fxos-simulators) by Nicola Greco.

## License

This program is free software; it is distributed under an
[Apache License](https://github.com/mozilla/node-firefox-find-simulators/blob/master/LICENSE).

## Copyright

Copyright (c) 2015 [Mozilla](https://mozilla.org)
([Contributors](https://github.com/mozilla/node-firefox-find-simulators/graphs/contributors)).

