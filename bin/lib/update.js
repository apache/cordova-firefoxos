#!/usr/bin/env node

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

var shell = require('shelljs'),
    path  = require('path'),
    fs    = require('fs'),
    ROOT  = path.join(__dirname, '..', '..');

function setShellFatal(value, func) {
    var oldVal = shell.config.fatal;
    shell.config.fatal = value;
    func();
    shell.config.fatal = oldVal;
}

function copyJs(projectPath) {
    shell.cp('-f', path.join(ROOT, 'cordova-lib', 'cordova.js'), path.join(projectPath, 'www'));
}

function copyScripts(projectPath) {
    var srcScriptsDir = path.join(ROOT, 'bin', 'templates', 'project', 'cordova');
    var destScriptsDir = path.join(projectPath, 'cordova');
    // Delete old scripts directory.
    shell.rm('-rf', destScriptsDir);
    // Copy in the new ones.
    shell.cp('-r', srcScriptsDir, projectPath);
    shell.cp('-r', path.join(ROOT, 'node_modules'), destScriptsDir);
    // Make sure they are executable.
    shell.find(destScriptsDir).forEach(function(entry) {
        shell.chmod(755, entry);
    });
}

exports.updateProject = function(projectPath) {
    var version = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf-8').trim();
    setShellFatal(true, function() {
        copyJs(projectPath);
        copyScripts(projectPath);
        console.log('FirefoxOS project is now at version ' + version);
    });
};

if (require.main === module) {
    (function() {
        var args = process.argv;
        if (args.length < 3 || (args[2] == '--help' || args[2] == '-h')) {
            console.log('Usage: ' + path.relative(process.cwd(), path.join(__dirname, 'update')) + ' <path_to_project>');
            process.exit(1);
        } else {
            exports.updateProject(args[2]);
        }
    })();
}

