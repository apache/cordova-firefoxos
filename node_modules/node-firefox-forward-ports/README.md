# node-firefox-forward-ports [![Build Status](https://secure.travis-ci.org/mozilla/node-firefox-forward-ports.png?branch=master)](http://travis-ci.org/mozilla/node-firefox-forward-ports)

> Forward local ports to remote debugging interfaces on connected Firefox OS devices

[![Install with NPM](https://nodei.co/npm/node-firefox-forward-ports.png?downloads=true&stars=true)](https://nodei.co/npm/node-firefox-forward-ports/)

This is part of the [node-firefox](https://github.com/mozilla/node-firefox) project.

Firefox OS devices offer a [Remote Debugging service](https://wiki.mozilla.org/Remote_Debugging_Protocol) 
on a local network socket. This can be forwarded to a host computer over USB
using ADB. This module takes care of that as necessary, reusing forwarded ports
when possible.

## Installation

### From git

```bash
git clone https://github.com/mozilla/node-firefox-forward-ports.git
cd node-firefox-forward-ports
npm install
```

If you want to update later on:

```bash
cd node-firefox-forward-ports
git pull origin master
npm install
```

### npm

```bash
npm install node-firefox-forward-ports
```

## Usage

```javascript
var forwardPorts = require('node-firefox-forward-ports');

// Forwards ports as necessary, while reusing existing ports.
// Returns the list of devices annotated with details on forwarded ports.
forwardPorts([
  {id: '3739ced5'},
  {id: 'full_keon'},
  {id: 'full_unagi'}
]).then(function(results) {
  console.log(results);
}).catch(function(err) {
  console.error(err);
});

// forwardPorts() can also accept an options object, for future expansion
// when additional options are supported.
forwardPorts({
  devices: [
    {id: '3739ced5'},
    {id: 'full_keon'},
    {id: 'full_unagi'}
  ]
}).then(function(results) {
  console.log(results);
}).catch(function(err) {
  console.error(err);
});

```

## Example

This example uses [node-firefox-find-devices](https://github.com/mozilla/node-firefox-find-devices)
to first assemble a list of connected Firefox OS devices. The output of
`findDevices()` is basically what `forwardPorts()` expects for its `devices`
option.

```javascript
var findDevices = require('node-firefox-find-devices');
var forwardPorts = require('node-firefox-forward-ports');

findDevices().then(forwardPorts).then(function(results) {
  console.log(results);
});
```

This example would result in output like the following, which consists of the
output of `findDevices()` altered to include a list of forward ports for each
device.

```javascript
[
  {
    "id": "3739ced5",
    "type": "device",
    "isFirefoxOS": true,
    "ports": [
      {
        "local": "tcp:8001",
        "remote": "localfilesystem:/data/local/debugger-socket",
        "port": "8001"
      }
    ]
  }
]
```

The listing of each device returned from `findDevices()` will be annotated with
a new `ports` property. This is a list of details on each port forwarded to the
device.

The `local` property contains the local side of the port forward. If this is a
TCP/IP port, then its numerical port can be found in the `port` property.

The `remote` property contains the remote side of the port forward, useful for
filtering and selecting particular kinds of forwarded ports. Currently, this
module only supports Firefox remote debugging sockets - but that could expand
in the future.

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
[Apache License](https://github.com/mozilla/node-firefox-forward-ports/blob/master/LICENSE).

## Copyright

Copyright (c) 2015 [Mozilla](https://mozilla.org)
([Contributors](https://github.com/mozilla/node-firefox-forward-ports/graphs/contributors)).
