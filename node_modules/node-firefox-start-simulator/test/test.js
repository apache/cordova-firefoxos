var assert = require("assert");
var should = require("should");
var Start = require("../");
var Q = require('q');


describe('fxos-start', function(){
  this.timeout(10000)

  describe('when no simulator is open', function(){

    it('should start a simulator', function(done) {
      Start()
        .then(function(sim) {
          process.kill(sim.pid);
          sim.pid.should.be.type('number');
          sim.port.should.be.type('number');
          sim.release.should.be.type('string');
        })
        .then(done)
        .fail(done);
    });

    it('should match given release', function(done) {
      Start({release:['2.1']})
        .then(function(sim) {
          process.kill(sim.pid);
          sim.release.should.equal('2.1');
        })
        .then(done)
        .fail(done);
    });

    it('should match given port', function(done) {
      Start({port:8081})
        .then(function(sim) {
          process.kill(sim.pid);
          sim.port.should.equal(8081);
        })
        .then(done)
        .fail(done);
    });
  });

  describe('when a simulator is open', function(){

    it('opts.force should force close the ones opened', function(done) {
      var first = Start({
        force: true,
        port: 8081
      }).fail(done);

      var second = first.then(function(sim) {
        return Start({force:true, port:8082});
      }).fail(done);

      Q.all([first, second])
        .spread(function(sim1, sim2) {
          sim2.pid.should.not.equal(sim1.pid);
          sim2.port.should.equal(8082);
          process.kill(sim2.pid);
          
        })
        .then(done)
        .fail(done);
    });


  });
});
