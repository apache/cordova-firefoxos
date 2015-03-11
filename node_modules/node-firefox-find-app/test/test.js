var assert = require("assert");
var should = require("should");
var FindApp = require("../");
var Ports = require("fx-ports");
var Start = require("fxos-start");
var Deploy = require("fxos-deploy/command");
var Q = require('q');


describe('fxos-findapp', function(){
  this.timeout(10000);

  afterEach(function() {
    Ports({b2g:true}, function(err, instances) {
      instances.forEach(function(i) {
        process.kill(i.pid);
      });
    });
  });

  describe('when no open simulator', function(){

    it('should find app manifest', function(done) {
      Start({connect:true, force: true})
        .then(function(sim) {
          return FindApp({
            manifestURL: './test/sampleapp/manifest.webapp',
            client: sim.client
          });
        })
        .then(function(app) {
          app.manifest.should.be.ok;
          app.manifest.name.should.be.type('string');
        })
        .then(done)
        .fail(done);
    });

    it('should throw error if not existing', function(done) {
      Start({connect:true, force: true})
        .then(function(sim) {
          return FindApp({
            manifestURL: './test/sampleapp/fake.webapp',
            client: sim.client
          });
        })
        .fail(function(err) {
          err.should.be.ok;
          done();
        });
    });

    it('should throw reuse existing client', function(done) {
      Start({connect:true, force: true})
        .then(function(sim) {

          return FindApp({
              manifestURL: './test/sampleapp/manifest.webapp',
              client: sim.client
            })
            .then(function(app) {
              app.manifest.should.be.ok;
              app.manifest.name.should.be.type('string');
            });

        }).then(done)
            .fail(done);

    });

  });

});