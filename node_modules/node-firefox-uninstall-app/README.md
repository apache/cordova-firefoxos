# node-firefox-uninstall-app [![Build Status](https://secure.travis-ci.org/mozilla/node-firefox-uninstall-app.png?branch=master)](http://travis-ci.org/mozilla/node-firefox-uninstall-app)

> Uninstall an installed app on a runtime.

This is part of the [node-firefox](https://github.com/mozilla/node-firefox) project.

*NOTE: This module is super experimental and the API is not totally stable yet. Use under your own responsibility.*

## Installation

### From git

```bash
git clone https://github.com/mozilla/node-firefox-uninstall-app.git
cd node-firefox-uninstall-app
npm install
```

If you want to update later on:

```bash
cd node-firefox-uninstall-app
git pull origin master
npm install
```

### npm

```bash
npm install node-firefox-uninstall-app
```

## Usage

```javascript
uninstallApp(options) // returns a Promise
```

where `options` is a plain `Object` which must contain the following:

* `manifestURL`: the manifest URL *in the client* (you must have obtained this after a call to <a href="https://github.com/mozilla/node-firefox-find-app"><tt>node-firefox-find-app</tt></a>. It's something that looks like: `manifestURL: 'app://13ab1444-736d-8c4b-83a6-b83afb5f1ea4/manifest.webapp'` in the result from `findApp`.
* `client`: the remote client from where we want to uninstall this app

If no `options` are provided, or if `options` is an empty `Object` (`{}`), then `uninstallApp` will fail (how can you uninstall *you don't know what app exactly* from *you don't know where*?)


### Installing and uninstalling a packaged app on a simulator

```javascript
startSimulator().then(function(simulator) {
  connect(simulator.port).then(function(client) {
    findApp({ client: client, manifest: manifest }).then(function(apps) {
      console.log('Found', apps.length, 'apps');
      Promise.all(apps.map(function(app) {
        console.log('Uninstalling', app.manifestURL);
        return uninstallApp({ manifestURL: app.manifestURL, client: client });
      })).then(function(results) {
        console.log('Installing', appPath);
        installApp({ appPath: appPath, client: client }).then(function() {
          findApp({ client: client, manifest: manifest }).then(function(app) {
            var firstApp = app[0];
            launchApp({ client: client, manifestURL: firstApp.manifestURL }).then(function(done) {
              console.log('Launched app');
            }, function(err) {
              console.error('App could not be launched', err);
            });
          });
        });
      });
    });
  });
});


```

You can have a look at the `examples` folder for a complete example.

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

## License

This program is free software; it is distributed under an
[Apache License](https://github.com/mozilla/node-firefox-uninstall-app/blob/master/LICENSE).

## Copyright

Copyright (c) 2015 [Mozilla](https://mozilla.org)
([Contributors](https://github.com/mozilla/node-firefox-uninstall-app/graphs/contributors)).

