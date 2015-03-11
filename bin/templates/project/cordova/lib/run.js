/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
*/

var path  = require('path');
var shell = require('shelljs');

exports.help = function(args) {
    console.log('Usage: ' + path.relative(process.cwd(), args[1]) + ' [options]');
    console.log('Deploy options :');
    console.log('    --device : Will deploy the built project to a device');
    console.log('    --emulator : Will deploy the built project to an emulator if one exists');
    console.log('    --list : List available device and emulator target ids');
    console.log('    --target=<target_id> : Installs to the target with the specified id.');
    process.exit(0);
}

exports.run = function(args) {

    var install_target = null;
    var use_emulator = null;
    var list = false;

    for (var i=2; i<args.length; i++) {
        if (args[i] == '--device') {
            use_emulator = false;
        } else if (args[i] == '--emulator') {
            use_emulator = true;
        } else if (/^--target=/.exec(args[i])) {
            install_target = args[i].substring(9, args[i].length);
        } else if (args[i] == '--list') {
            list = true;
        } else {
            console.warn('Option \'' + args[i] + '\' not recognized (ignoring).');
        }
    }

    try {

        var devices = runHelperScript('list-devices');
        var emulators = runHelperScript('list-emulator-images');

        if (list) {
            if (!install_target || install_target == '--emulator') {
                console.log('Available Firefox OS Simulators:');
                console.log(emulators.map(function(item) { return "\t" + item }).join("\n"));
            }
            if (!install_target || install_target == '--device') {
                console.log('Available Firefox OS Devices:');
                console.log(devices.map(function(item) { return "\t" + item }).join("\n"));
            }
            return;
        }

        if (install_target) {
            
            // We have an install target, so figure out if it's device or emulator.
            if (emulators.indexOf(install_target) !== -1) {
                use_emulator = true;
            } else if (devices.indexOf(install_target) !== -1) {
                use_emulator = false;
            } else {
                throw new Error('target \'' + install_target + '\' is neither a device nor an emulator'); 
            }

        } else {

            // No explicit install target. If neither device nor emulator was
            // called for specifically, we'll look for a device first and then
            // fall back to an emulator. Otherwise, we'll limit looking for
            // whichever was explictly called for.
            
            if ((use_emulator === null || use_emulator === false)) {
                if (devices.length) {
                    // Found a device, so use it as default target
                    install_target = devices[devices.length - 1];
                    use_emulator = false;
                    console.log('WARNING : No target specified, deploying to device \'' + install_target + '\'.');
                }
            }

            if ((use_emulator === null || use_emulator === true)) {
                var running_emulators = runHelperScript('list-started-emulators');
                if (running_emulators.length) {
                    // Found a running emulator, so use it as default target.
                    install_target = emulators[emulators.length - 1];
                    use_emulator = true;
                    console.log('WARNING : No target specified, deploying to running emulator \'' + install_target + '\'.');
                } else if (emulators.length) {
                    // Found an emulator, so use it as default target.
                    install_target = emulators[emulators.length - 1];
                    use_emulator = true;
                    console.log('WARNING : No target specified, starting and deploying to emulator \'' + install_target + '\'.');
                }
            }

        }

        if (!install_target || use_emulator === null) {
            // Something went wrong in the selection process above, and we have
            // no installation target.
            throw new Error('no installation target could be found');
        }
        
        var install_script = use_emulator ? 'install-emulator' : 'install-device';
        console.log(runHelperScript(install_script + ' --target=' + install_target, true));

    } catch (err) {
        console.error('' + err);
    }

}

function runHelperScript(script, skipParse) {
    var result = shell.exec(path.join(__dirname, script), {silent:true});
    if (result.code !== 0) {
        throw new Error(script + ' failed with exit code ' + result.code + ' - ' + result.output);
    }
    if (skipParse) {
        return result.output;
    }
    return result.output.split(/\n/)
        .filter(function(line) { return line != ''; })
        .map(function(line) { return line.split(/\s/)[0]; });
}
