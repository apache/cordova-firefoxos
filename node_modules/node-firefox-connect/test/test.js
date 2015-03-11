var assert = require("assert");
var should = require("should");
var Connect = require("../");
var Start = require("fxos-start");
var Ports = require("fx-ports");
var Q = require('q');


describe('fxos-connect', function(){
  this.timeout(10000);
  afterEach(function() {
    Ports({b2g:true}, function(err, instances) {
      instances.forEach(function(i) {
        process.kill(i.pid);
      });
    });
  });

  describe('when no simulator is open', function(){

    it('should start a simulator', function(done) {
      Connect()
        .then(function(sim) {
          sim.pid.should.be.type('number');
          sim.port.should.be.type('number');
          sim.release.should.be.type('string');
        })
        .then(done)
        .fail(done);
    });

    it('should match given release', function(done) {
      Connect({release:['2.1']})
        .then(function(sim) {
          sim.release.should.equal('2.1');
        })
        .then(done)
        .fail(done);
    });

    it('should match given port', function(done) {
      Connect({port:8081})
        .then(function(sim) {
          sim.port.should.equal(8081);
        })
        .then(done)
        .fail(done);
    });
  });

  describe('when a simulator is open', function(){

    it('should find a simulator', function(done) {
      var starting = Start({
        connect:false,
        force:true
      });
      var connecting = starting.then(function(sim) {
        return Connect();
      });

      Q.all([connecting, starting])
        .spread(function(sim1, sim2) {
          sim1.pid.should.equal(sim2.pid);
        })
        .then(done)
        .fail(done);
    });

    it('should reuse if release matches', function(done) {
      var starting = Start({
        connect:false,
        force: true,
        release: ['2.1']
      });
      var connecting = starting.then(function(sim) {
        return Connect();
      });

      Q.all([connecting, starting])
        .spread(function(sim1, sim2) {
          var regex = new RegExp("^(" + sim2.release + ")");
          assert(regex.exec(sim1.release));
        })
        .then(done)
        .fail(done);
    });


    it('should reuse if port matches', function(done) {
      var starting = Start({
        connect:false,
        force: true,
        port: 8081
      });
      var connecting = starting.then(function(sim) {
        return Connect();
      });

      Q.all([connecting, starting])
        .spread(function(sim1, sim2) {
          sim1.port.should.equal(sim2.port);
        })
        .then(done)
        .fail(done);
    });

    it('should start new sim if port not matching', function(done) {
      var starting = Start({
        connect:false,
        force: true,
        port: 8081
      }).fail(done);
      var connecting = starting.then(function(sim) {
        return Connect({force:true, port:8082});
      }).fail(done);

      Q.all([connecting, starting])
        .spread(function(sim1, sim2) {
          sim1.pid.should.not.equal(sim2.pid);
          sim1.port.should.equal(8082);
        })
        .then(done)
        .fail(done);
    });
  });

  describe('opts.connect', function(){
    it('should return a simulator obj with client instance', function(done) {
      Connect({connect: true})
        .then(function(sim) {
          sim.client.disconnect();
          should.exist(sim.client);
        })
        .then(done)
        .fail(done);
    });
  });

  describe('callback', function(){
    it('should return a simulator obj with client instance', function(done) {
      Connect(function(err, sim) {
        sim.client.disconnect();
        should.exist(sim.client);
        done();
      });
    });

    it('should return a simulator obj', function(done) {
      Connect({port:8081}, function(err, sim) {
        sim.port.should.equal(8081);
        done();
      });
    });
  });

});