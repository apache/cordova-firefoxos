(function() {
  var Parser, Promise, Protocol,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Promise = require('bluebird');

  Protocol = require('./protocol');

  Parser = (function() {
    Parser.FailError = (function(_super) {
      __extends(FailError, _super);

      function FailError(message) {
        Error.call(this);
        this.name = 'FailError';
        this.message = "Failure: '" + message + "'";
        Error.captureStackTrace(this, Parser.FailError);
      }

      return FailError;

    })(Error);

    Parser.PrematureEOFError = (function(_super) {
      __extends(PrematureEOFError, _super);

      function PrematureEOFError(howManyMissing) {
        Error.call(this);
        this.name = 'PrematureEOFError';
        this.message = "Premature end of stream, needed " + howManyMissing + " more bytes";
        this.missingBytes = howManyMissing;
        Error.captureStackTrace(this, Parser.PrematureEOFError);
      }

      return PrematureEOFError;

    })(Error);

    Parser.UnexpectedDataError = (function(_super) {
      __extends(UnexpectedDataError, _super);

      function UnexpectedDataError(unexpected, expected) {
        Error.call(this);
        this.name = 'UnexpectedDataError';
        this.message = "Unexpected '" + unexpected + "', was expecting " + expected;
        this.unexpected = unexpected;
        this.expected = expected;
        Error.captureStackTrace(this, Parser.UnexpectedDataError);
      }

      return UnexpectedDataError;

    })(Error);

    function Parser(stream) {
      this.stream = stream;
    }

    Parser.prototype.raw = function() {
      return this.stream;
    };

    Parser.prototype.readAll = function() {
      var all, endListener, errorListener, resolver, tryRead;
      all = new Buffer(0);
      resolver = Promise.defer();
      tryRead = (function(_this) {
        return function() {
          var chunk, _results;
          _results = [];
          while (chunk = _this.stream.read()) {
            _results.push(all = Buffer.concat([all, chunk]));
          }
          return _results;
        };
      })(this);
      this.stream.on('readable', tryRead);
      this.stream.on('error', errorListener = function(err) {
        return resolver.reject(err);
      });
      this.stream.on('end', endListener = function() {
        return resolver.resolve(all);
      });
      tryRead();
      return resolver.promise.cancellable()["finally"]((function(_this) {
        return function() {
          _this.stream.removeListener('readable', tryRead);
          _this.stream.removeListener('error', errorListener);
          return _this.stream.removeListener('end', endListener);
        };
      })(this));
    };

    Parser.prototype.readAscii = function(howMany) {
      return this.readBytes(howMany).then(function(chunk) {
        return chunk.toString('ascii');
      });
    };

    Parser.prototype.readBytes = function(howMany) {
      var endListener, errorListener, resolver, tryRead;
      resolver = Promise.defer();
      tryRead = (function(_this) {
        return function() {
          var chunk;
          if (howMany) {
            if (chunk = _this.stream.read(howMany)) {
              howMany -= chunk.length;
              if (howMany === 0) {
                return resolver.resolve(chunk);
              }
            }
          } else {
            return resolver.resolve(new Buffer(0));
          }
        };
      })(this);
      endListener = function() {
        return resolver.reject(new Parser.PrematureEOFError(howMany));
      };
      errorListener = function(err) {
        return resolver.reject(err);
      };
      this.stream.on('readable', tryRead);
      this.stream.on('error', errorListener);
      this.stream.on('end', endListener);
      tryRead();
      return resolver.promise.cancellable()["finally"]((function(_this) {
        return function() {
          _this.stream.removeListener('readable', tryRead);
          _this.stream.removeListener('error', errorListener);
          return _this.stream.removeListener('end', endListener);
        };
      })(this));
    };

    Parser.prototype.readByteFlow = function(howMany) {
      var endListener, errorListener, resolver, tryRead;
      resolver = Promise.defer();
      tryRead = (function(_this) {
        return function() {
          var chunk, _results;
          if (howMany) {
            _results = [];
            while (chunk = _this.stream.read(howMany) || _this.stream.read()) {
              howMany -= chunk.length;
              if (howMany === 0) {
                resolver.progress(chunk);
                resolver.resolve();
                break;
              }
              _results.push(resolver.progress(chunk));
            }
            return _results;
          } else {
            return resolver.resolve();
          }
        };
      })(this);
      endListener = function() {
        return resolver.reject(new Parser.PrematureEOFError(howMany));
      };
      errorListener = function(err) {
        return resolver.reject(err);
      };
      this.stream.on('readable', tryRead);
      this.stream.on('error', errorListener);
      this.stream.on('end', endListener);
      tryRead();
      return resolver.promise.cancellable()["finally"]((function(_this) {
        return function() {
          _this.stream.removeListener('readable', tryRead);
          _this.stream.removeListener('error', errorListener);
          return _this.stream.removeListener('end', endListener);
        };
      })(this));
    };

    Parser.prototype.readError = function() {
      return this.readValue().then(function(value) {
        return Promise.reject(new Parser.FailError(value.toString()));
      });
    };

    Parser.prototype.readValue = function() {
      return this.readAscii(4).then((function(_this) {
        return function(value) {
          var length;
          length = Protocol.decodeLength(value);
          return _this.readBytes(length);
        };
      })(this));
    };

    Parser.prototype.readUntil = function(code) {
      var read, skipped;
      skipped = new Buffer(0);
      read = (function(_this) {
        return function() {
          return _this.readBytes(1).then(function(chunk) {
            if (chunk[0] === code) {
              return skipped;
            } else {
              skipped = Buffer.concat([skipped, chunk]);
              return read();
            }
          });
        };
      })(this);
      return read();
    };

    Parser.prototype.searchLine = function(re) {
      return this.readLine().then((function(_this) {
        return function(line) {
          var match;
          if (match = re.exec(line)) {
            return match;
          } else {
            return _this.searchLine(re);
          }
        };
      })(this));
    };

    Parser.prototype.readLine = function() {
      return this.readUntil(0x0a).then(function(line) {
        if (line[line.length - 1] === 0x0d) {
          return line.slice(0, -1);
        } else {
          return line;
        }
      });
    };

    Parser.prototype.unexpected = function(data, expected) {
      return Promise.reject(new Parser.UnexpectedDataError(data, expected));
    };

    return Parser;

  })();

  module.exports = Parser;

}).call(this);
