var path = require('path');
var fs = require('fs');

var Promise = require('es6-promise').Promise;

var findSimulators = require('node-firefox-find-simulators');
var findPorts = require('node-firefox-find-ports');
var connect = require('node-firefox-connect');
var installApp = require('node-firefox-install-app');
var findApp = require('node-firefox-find-app');
var launchApp = require('node-firefox-launch-app');
var uninstallApp = require('node-firefox-uninstall-app');
var startSimulator = require('node-firefox-start-simulator');

var common = exports;

common.collectSimulatorVersions = function() {
    // There can be multiple Firefox installations, each with their own set of
    // FxOS simulator addons. But, they're only unique by version. So, this
    // just collects versions.
    return findSimulators().then(function (simulators) {
        var versions = {};
        simulators.forEach(function (simulator) {
            versions[simulator.version] = true;
        });
        return Object.keys(versions).sort();
    });
};

common.collectRunningSimulatorsByVersion = function () {
    return findPorts({
        firefoxOSSimulator: true,
        detailed: true 
    }).then(function(results) {
        var ports_by_version = {};
        results.forEach(function (result) {
            var release_parts = result.release.split(/\./g);
            result.version = release_parts[0] + '.' + release_parts[1];
            ports_by_version[result.version] = result;
        });
        return ports_by_version;
    });
};

common.findOrStartSimulatorTarget = function (install_target) {
    return common.collectRunningSimulatorsByVersion().then(function (running) {
        if (!install_target) {
            install_target = Object.keys(running)[0];
        }
        if (!install_target) {
            throw new Error('no emulator target found');
        }
        if (install_target in running) {
            return running[install_target];
        }
        return common.collectSimulatorVersions().then(function (versions) {
            if (install_target && versions.indexOf(install_target) === -1) {
                throw new Error('emulator \'' + install_target + '\' does not exist.');
            }
            return startSimulator({
                version: install_target,
                detached: true
            }).then(function (simulator) {
                return common.collectRunningSimulatorsByVersion();
            }).then(function (running) {
                return running[install_target];
            });
        });
    });
};

common.pushApp = function (client) {

    var appPath = path.join(path.dirname(path.dirname(__dirname)), 'www');
    var manifest = JSON.parse(fs.readFileSync(appPath + '/manifest.webapp'));

    // TODO: replace most of this with node-firefox-push-app when it exists
    // https://github.com/mozilla/node-firefox/issues/37
    return findApp({
        client: client,
        manifest: manifest
    }).then(function(apps) {
        return Promise.all(apps.map(function (app) {
          return uninstallApp({
              client: client,
              manifestURL: app.manifestURL
          });
        }));
    }).then(function(uninstalled) {
        return installApp({
            client: client,
            appPath: appPath
        });
    }).then(function(result) {
        return findApp({
            client: client,
            manifest: manifest
        });
    }).then(function(apps) {
        return launchApp({
            client: client,
            manifestURL: apps[0].manifestURL
        });
    });
}
