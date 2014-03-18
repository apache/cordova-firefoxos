#!/usr/bin/env node

/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
 
var path = require('path'),
    fs = require('fs'),
    clean = require('./clean'),
    shjs = require('shelljs'),
    zip = require('adm-zip'),
    check_reqs = require('./check_reqs'),
    buildDirInMerge ='build--release';

function hasCustomReleaseArtifactsDir() {
    return fs.existsSync('platforms/firefoxos/www/'+buildDirInMerge);
}

function hasAllRequiredCustomReleaseArtifacts() {
    if(!fs.existsSync('platforms/firefoxos/www/'+buildDirInMerge+'/manifest.webapp')) { 
        console.error('\nPlease provide <project>/merges/firefoxos/'+buildDirInMerge+'/manifest.webapp');
    }

    if(!fs.existsSync('platforms/firefoxos/www/'+buildDirInMerge+'/index.html')) {
        console.error('\nPlease provide <project>/merges/firefoxos/'+buildDirInMerge+'/index.html');
    }

    return (   fs.existsSync('platforms/firefoxos/www/'+buildDirInMerge+'/manifest.webapp')
            && fs.existsSync('platforms/firefoxos/www/'+buildDirInMerge+'/index.html') );
}

function mergeMiniManifest() {
    // console.log('pwd: '+shjs.pwd());
    console.log('Merge (mini-)manifest.webapp provided at \'merges/firefoxos/'+buildDirInMerge+'/\'');
    shjs.mv('-f' ,'platforms/firefoxos/www/'+buildDirInMerge+'/manifest.webapp', 'platforms/firefoxos/build/manifest.webapp');
}

function mergeIndexHtml() {
    // console.log('pwd: '+shjs.pwd());
    console.log('Merge index.html provided at \'merges/firefoxos/'+buildDirInMerge+'/\'');
    shjs.mv('-f', 'platforms/firefoxos/www/'+buildDirInMerge+'/index.html', 'platforms/firefoxos/build/index.html');
}

// cordova merges merge/firefoxos to platforms/firefoxos/www
// this removes the ''build' directory
function removeMergesFirefoxosBuildFromWWW() {
    console.log('Remove '+buildDirInMerge+' from \'platforms/firefoxos/www\'');
    if(fs.existsSync('platforms/firefoxos/www/'+buildDirInMerge)) {
        shjs.rm('-r', 'platforms/firefoxos/www/'+buildDirInMerge);
    }
}


/**
 * buildProject
 *   --debug (default):
 *      
 *
 *   --release
 *
 *
 */
exports.buildProject = function(buildTarget){

    // Check that requirements are (stil) met
    if(!check_reqs.run()) {
        console.error('Please make sure you meet the software requirements in order to build a firefoxos cordova project');
        process.exit(2);
    }
    
    clean.cleanProject(); // remove old build result
    
    // if 'debug' (default), remove files we only need for 'release'
    if(buildTarget == 'debug') {
        // clean.cleanProject(); // remove old build result
        if(hasCustomReleaseArtifactsDir()){ 
            removeMergesFirefoxosBuildFromWWW();
        }
        process.exit(0);
    }

    if(buildTarget == 'release') {
        console.log('Building Firefoxos project');
        // clean.cleanProject(); // remove old build result
    
        if(!hasAllRequiredCustomReleaseArtifacts()) {
               console.error('Check \'https://developer.mozilla.org/en-US/Marketplace/Publishing/Packaged_apps\' for the required artifacts');
               process.exit(2);
           
        }

        if(!fs.existsSync('platforms/firefoxos/build')) {
            // first run, or project has been cleaned
            fs.mkdir('platforms/firefoxos/build'); 
        }

        mergeMiniManifest();
        mergeIndexHtml();
        removeMergesFirefoxosBuildFromWWW(); 

        // add the project in a zipfile
        var zipFile = zip();
        zipFile.addLocalFolder('platforms/firefoxos/www', '.');
        zipFile.writeZip("platforms/firefoxos/build/package.zip");

        process.exit(0);
    }

    // should never get here
    console.error('Illegal target to build a firefoxos cordova project');
    process.exit(2);

}

module.exports.help = function() {
    console.log('Usage: ' + path.relative(process.cwd(), path.join(__dirname, 'build')) + ' [build_type]');
    console.log('Build Types : ');
    console.log('    \'--debug\': Default build.');
    console.log('    \'--release\': will build a zip-file of the project in \'platforms/firefoxos/build\'.');
    console.log('                  Please provide manifest.webapp and index.html in merges/firefoxos/'+buildDirInMerge);
}


