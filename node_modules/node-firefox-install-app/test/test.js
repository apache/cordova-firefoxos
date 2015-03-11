var assert = require("assert");
var should = require("should");
var Deploy = require("../");
var DeployCmd = require("../command");
var Ports = require("fx-ports");
var Connect = require("fxos-connect");
var Q = require('q');

describe('fxos-deploy', function(){
  this.timeout(10000);
  afterEach(function() {
    Ports({b2g:true}, function(err, instances) {
      instances.forEach(function(i) {
        process.kill(i.pid);
      });
    });
  });

  describe('when no open simulator', function(){

    it('should return app id', function(done) {

      Connect(function(err, sim) {
        return Deploy({
          manifestURL: './test/sampleapp/manifest.webapp',
          zip: './test/sampleapp/build/app.zip',
          client: sim.client
        })
        .then(function(sim) {
          sim.should.be.type('string');
        })
        .then(done)
        .fail(done);
      });

    });

  });


  describe('fxos-deploy/command', function(done) {

    it('should deploy app and disconnect', function(done) {
      DeployCmd({
        manifestURL: './test/sampleapp/manifest.webapp',
        zip: './test/sampleapp/build/app.zip'
      }, function(err, result, next) {
        
        result.value.should.be.type('string');
        result.client.should.be.ok;
        next();
      }, done);
    });

    it('should connect to a specific port', function(done) {
      DeployCmd({
        manifestURL: './test/sampleapp/manifest.webapp',
        zip: './test/sampleapp/build/app.zip',
        port: 8181
      }, function(err, result, next) {
        Ports({b2g:true}, function(err, instances) {
          instances[0].port.should.equal(8181);
          next();
        })
      }, done);
    });

  });

});