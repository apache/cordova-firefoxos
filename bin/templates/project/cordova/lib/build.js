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

function hasMergesCustomReleaseArtifactsDir() {
    return fs.existsSync('merges/firefoxos/'+buildDirInMerge);
}


function hasCustomReleaseArtifactsDir() {
    return fs.existsSync('platforms/firefoxos/www/'+buildDirInMerge);
}

/**
 * hasAllMergesRequiredCustomReleaseArtifacts()
 * checks that merges/firefoxos/build--release is avialable and properly filled.
 *
 */
function hasAllMergesRequiredCustomReleaseArtifacts() {
    if(!fs.existsSync('merges/firefoxos/'+buildDirInMerge+'/manifest.webapp')) { 
        console.error('\nPlease provide <project>/merges/firefoxos/'+buildDirInMerge+'/manifest.webapp');
    }

    if(!fs.existsSync('merges/firefoxos/'+buildDirInMerge+'/index.html')) {
        console.error('\nPlease provide <project>/merges/firefoxos/'+buildDirInMerge+'/index.html');
    }

    return (   fs.existsSync('merges/firefoxos/'+buildDirInMerge+'/manifest.webapp')
            && fs.existsSync('merges/firefoxos/'+buildDirInMerge+'/index.html') );
}

/**
 * hasAllRequiredCustomReleaseArtifacts()
 * checks that 'cordova prepare' has copied merges/firefoxos to platforms/firefoxos/www
 *
 */
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


function moveWwwBuildReleaseToBuild() {
    hasAllRequiredCustomReleaseArtifacts();
    console.log('Move files at  provided at \'merges/firefoxos/'+buildDirInMerge+'/\' to platforms/firefoxos/build');
    shjs.mv('-f', 'platforms/firefoxos/www/'+buildDirInMerge+'/index.html', 'platforms/firefoxos/build/index.html');
    shjs.mv('-f' ,'platforms/firefoxos/www/'+buildDirInMerge+'/manifest.webapp', 'platforms/firefoxos/build/manifest.webapp');
}




// cordova merges merge/firefoxos to platforms/firefoxos/www
// this removes the 'build--release' directory from platforms/firefoxos/www
function removeWwwBuildRelease() {
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
        if(hasCustomReleaseArtifactsDir()){ 
            removeWwwBuildRelease();
        }
        process.exit(0);
    }

    if(buildTarget == 'release') {
        console.log('Building Firefoxos project');

        if(!hasAllMergesRequiredCustomReleaseArtifacts()) {
               console.error('\nCheck \'https://developer.mozilla.org/en-US/Marketplace/Publishing/Packaged_apps\' for the required artifacts');
               console.error('\n');
               process.exit(2);
        }

        if(!hasAllRequiredCustomReleaseArtifacts()) {
               console.error('\nIf merges/firefoxos/build-release has proper content, make sure \'cordova prepare firefoxos\' is run.');
               console.error('\n');
               process.exit(2);
        }

        if(!fs.existsSync('platforms/firefoxos/build')) {
            fs.mkdir('platforms/firefoxos/build'); 
        }

        moveWwwBuildReleaseToBuild();
        removeWwwBuildRelease(); 

        // add the project in a zipfile
        var zipFile = zip();
        zipFile.addLocalFolder('platforms/firefoxos/www', '.');
        zipFile.writeZip("platforms/firefoxos/build/package.zip");

        process.exit(0);
    }

    // should never get here
    console.error('Illegal target to build a firefoxos cordova project ('+buildTarget+')');
    process.exit(2);

}

module.exports.help = function() {
    console.log('Usage: ' + path.relative(process.cwd(), path.join(__dirname, 'build')) + ' [build_type]');
    console.log('Build Types : ');
    console.log('    \'--debug\': Default build.');
    console.log('    \'--release\': will build a zip-file of the project in \'platforms/firefoxos/build\'.');
    console.log('                  Please provide manifest.webapp and index.html in merges/firefoxos/'+buildDirInMerge);
}


