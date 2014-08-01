#!/usr/bin/env node

/*
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements. See the NOTICE file
distributed with this work for additional information
regarding copyright ownership. The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied. See the License for the
specific language governing permissions and limitations
under the License.
*/

var exec = require('shelljs').exec,
    os = process.platform,
    B2G_BIN_OSX = 'b2g/B2G.app/Contents/MacOS/b2g-bin',
    FX_PROFILES_OSX = 'Library/Application Support/Firefox/Profiles',
    B2G_BIN_LINUX = 'b2g/b2g-bin',
    FX_PROFILES_LINUX = '.mozilla/firefox',
    NETSTAT_CMD = 'netstat -lnptu',
    LSOF_CMD = 'lsof -i -n -P -sTCP:LISTEN';

exports.discoverPorts = function (callback) {
    
    var ports = [];

    if (os == 'darwin') {
        var output = exec(LSOF_CMD, {silent: true}).output;
        var regex = /^b2g[-bin]?.*[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:([0-9]*)/;
        var lines = output.split('\n');
        lines.forEach(function(line) {
            var matches = regex.exec(line);
            if (matches && +matches[1] != 2828)
                ports.push(+matches[1])
        })
 
    } else
    if (os == 'linux') {
        var output = exec(NETSTAT_CMD, {silent: true}).output;
        var regex = /tcp.*[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:([0-9]+).*LISTEN.*\/b2g[-bin]?/
        var lines = output.split('\n');
        lines.forEach(function(line) {
            var matches = regex.exec(line);
            if (matches && +matches[1] != 2828)
                ports.push(+matches[1])
        })
 
    } else {
        return callback(new Error("OS not supported for running"))
    }
 
    callback(null, ports)
 
}

if (require.main === module) {
    (function() {
        exports.discoverPorts(function(err, ports){
            if (err) return console.log(err)
            console.log("Running FirefoxOS simulators (B2G) on ports", ports)
        });
    })();
}
