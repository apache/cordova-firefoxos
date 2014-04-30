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
    buildReleaseDirInMerge  = 'build--release',
    platformWwwDir          = path.join('platforms', 'firefoxos', 'www'),
    platformBuildDir        = path.join('platforms', 'firefoxos', 'build'),
    buildReleaseDirInWwwDir = path.join(platformWwwDir, buildReleaseDirInMerge)
;

function hasMergesCustomReleaseArtifactsDir() {
    return fs.existsSync(path.join('merges', 'firefoxos', buildReleaseDirInMerge));
}

function hasCustomReleaseArtifactsDir() {
    return fs.existsSync(path.join(platformWwwDir,buildReleaseDirInMerge));
}

/**
 * hasAllMergesRequiredCustomReleaseArtifacts()
 * checks that merges/firefoxos/build--release is avialable and properly filled.
 *
 */
function hasAllRequiredCustomReleaseArtifacts() {
    var mergeDir = path.join('merges', 'firefoxos', buildReleaseDirInMerge);
    if (!fs.existsSync( path.join(mergeDir, 'manifest.webapp'))) { 
        console.error('\nPlease provide <project> '+mergeDir+'/manifest.webapp');
    }

    if (!fs.existsSync( path.join(mergeDir, 'index.html'))) {
        console.error('\nPlease provide <project> '+mergeDir+'/index.html');
    }

    return (   fs.existsSync( path.join(mergeDir, 'manifest.webapp'))
            && fs.existsSync( path.join(mergeDir, 'index.html')) );
}

/**
 * hasCopiedRequiredCustomReleaseArtifacts()
 * checks that 'cordova prepare' has copied merges/firefoxos to platforms/firefoxos/www
 *
 */
function hasCopiedAllRequiredCustomReleaseArtifacts() {
    if (!fs.existsSync( path.join(buildReleaseDirInWwwDir, 'manifest.webapp'))) { 
        console.error('\n'+path.join(buildReleaseDirInWwwDir, 'manifest.webapp')+' is not found');
    }

    if (!fs.existsSync( path.join(buildReleaseDirInWwwDir, 'index.html'))) {
        console.error('\n'+path.join(buildReleaseDirInWwwDir, 'index.html')+' is not found');
    }

    return (   fs.existsSync( path.join(buildReleaseDirInWwwDir, 'manifest.webapp'))
            && fs.existsSync( path.join(buildReleaseDirInWwwDir, 'index.html')) );
}

function moveWwwBuildReleaseToBuild() {
    hasAllRequiredCustomReleaseArtifacts();
    
    shjs.mv('-f', path.join(buildReleaseDirInWwwDir, 'index.html'),       path.join(platformBuildDir, 'index.html'));
    shjs.mv('-f' ,path.join(buildReleaseDirInWwwDir, 'manifest.webapp'),  path.join(platformBuildDir, 'manifest.webapp'));
}

// cordova merges merge/firefoxos to platforms/firefoxos/www
// this removes the 'build--release' directory from platforms/firefoxos/www
function removeWwwBuildRelease() {
    if (fs.existsSync(buildReleaseDirInWwwDir)) {
        shjs.rm('-r', buildReleaseDirInWwwDir);
    }
}

/**
 * buildProject
 *   --debug (default):      
 *
 *   --release
 *
 */
exports.buildProject = function(buildTarget){

    // Check that requirements are (stil) met
    if (!check_reqs.run()) {
        console.error('Please make sure you meet the software requirements in order to build a firefoxos cordova project');
        process.exit(2);
    }
    
    clean.cleanProject(); // remove old build result
    
    // if 'debug' (default), remove files we only need for 'release'
    if (buildTarget == 'debug') {
        if(hasCustomReleaseArtifactsDir()){ 
            removeWwwBuildRelease();
        }
        process.exit(0);
    }

    if (buildTarget == 'release') {
        console.log('Building Firefoxos project in '+platformBuildDir);

        if (!hasAllRequiredCustomReleaseArtifacts()) {
               console.error('\nCheck \'https://developer.mozilla.org/en-US/Marketplace/Publishing/Packaged_apps\' for the required artifacts');
               console.error('\n');
               process.exit(2);
        }

        if (!hasCopiedAllRequiredCustomReleaseArtifacts()) {
               console.error('\nIf merges/firefoxos/build-release has proper content, make sure \'cordova prepare firefoxos\' is run.');
               console.error('\n');
               process.exit(2);
        }

        if (!fs.existsSync(platformBuildDir)) {
            fs.mkdir(platformBuildDir); 
        }

        moveWwwBuildReleaseToBuild();
        removeWwwBuildRelease(); 

        // add the project to a zipfile
        var zipFile = zip();
        zipFile.addLocalFolder(platformWwwDir, '.');
        zipFile.writeZip(path.join(platformBuildDir, 'package.zip'));

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
    console.log('    \'--release\': will build a zip-file of the project in \''+platformBuildDir+'\'.');
    console.log('                  Please provide manifest.webapp and index.html in '+path.join('merges', 'firefoxos', buildReleaseDirInMerge));
}

