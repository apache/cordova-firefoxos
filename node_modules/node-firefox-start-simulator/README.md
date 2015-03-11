# node-firefox-start-simulator [![Build Status](https://secure.travis-ci.org/mozilla/node-firefox-start-simulator.png?branch=master)](http://travis-ci.org/mozilla/node-firefox-start-simulator)

> Start a Firefox OS simulator.

[![Install with NPM](https://nodei.co/npm/node-firefox-start-simulator.png?downloads=true&stars=true)](https://nodei.co/npm/node-firefox-start-simulator/)

This is part of the [node-firefox](https://github.com/mozilla/node-firefox) project.

## Installation

### From git

```sh
git clone https://github.com/mozilla/node-firefox-start-simulator.git
cd node-firefox-start-simulator
npm install
```

If you want to update later on:

```sh
cd node-firefox-start-simulator
git pull origin master
npm install
```

### npm

```sh
npm install node-firefox-start-simulator
```

## Usage

```javascript
var startSimulator = require('node-firefox-start-simulator');

// `startSimulator` returns a Promise
startSimulator(options).then(function(simulator) {

});
```

where `options` is a plain `Object` with any of the following:

* `detached`: start the simulator as a detached process. If our script is killed, the simulator will still be running.
* `port`: make the simulator listen to this port for debugging. If not specified, we'll find an available port.
* `version`: start a simulator in this version. If not specified, we'll start the first simulator that we can find.
* `verbose`: pipe the output from the simulator to standard I/O. For example, you'll get JavaScript `console.log` messages executed in the simulator.

and `simulator` is an object containing:

* `binary`: path to the simulator binary
* `profile`: path to the simulator profile
* `pid`: process id
* `process`: the actual process object
* `port`: the port where the simulator is listening for debugging connections

## Examples

### Start any simulator on the first available port

```javascript
var startSimulator = require('node-firefox-start-simulator');

startSimulator().then(function(simulator) {
  console.log('Started simulator at port', simulator.port);
}, function(err) {
  console.log('Error starting a simulator', err);
});

```

Have a look at the `examples` folder for more!

<!-- These examples need updating to the Promise style and what we're actually returning
#### Start a simulator on a given port, connect and return client

Start a FirefoxOS simulator and connect to it through [firefox-client](https://github.com/harthur/firefox-client) by returning `client`.
```javascript
var start = require('./node-firefox-start-simulator');
start({ port: 1234, connect: true }, function(err, sim) {
  // Let's show for example all the running apps
  sim.client.getWebapps(function(err, webapps) {
    webapps.listRunningApps(function(err, apps) {
      console.log("Running apps:", apps);
    });
  });
})
```

#### Start a simulator on known port without connecting
Just start a FirefoxOS simulator without opening a connection:

```javascript
var start = require('./node-firefox-start-simulator');
start({ port: 1234, connect: false }, function(err, sim) {
  // Let's show for example all the running apps
  sim.client.connect(1234, function() {
    client.getWebapps(function(err, webapps) {
      webapps.listRunningApps(function(err, apps) {
        console.log("Running apps:", apps);
      });
    });
  });
})
```

#### Start and kill simulator

```javascript
var start = require('./node-firefox-start-simulator');
start({ connect: true }, function(err, sim) {
  sim.client.disconnect();
  process.kill(sim.pid);
})
```

#### Force start a simulator

```javascript
var start = require('./node-firefox-start-simulator');
start({ connect: true, force: true }, function(err, sim) {
  sim.client.disconnect();
  process.kill(sim.pid);
})
```
-->

## Documentation

If you want to contribute to this module, it might be interesting to have a look at the way WebIDE launches the simulator. The code for this is in [simulator-process.js](https://dxr.mozilla.org/mozilla-central/source/b2g/simulator/lib/simulator-process.js). Whenever possible, we want to mimic the WebIDE experience as closely as possible.

## History

This is based on initial work on fxos-start by Nicola Greco.

