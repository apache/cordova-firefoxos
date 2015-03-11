(function() {
  var Command, LineTransform, Parser, Promise, Protocol, ScreencapCommand,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Promise = require('bluebird');

  Command = require('../../command');

  Protocol = require('../../protocol');

  Parser = require('../../parser');

  LineTransform = require('../../linetransform');

  ScreencapCommand = (function(_super) {
    __extends(ScreencapCommand, _super);

    function ScreencapCommand() {
      return ScreencapCommand.__super__.constructor.apply(this, arguments);
    }

    ScreencapCommand.prototype.execute = function() {
      this._send('shell:screencap -p 2>/dev/null');
      return this.parser.readAscii(4).then((function(_this) {
        return function(reply) {
          var endListener, out, readableListener, resolver;
          switch (reply) {
            case Protocol.OKAY:
              resolver = Promise.defer();
              out = _this.parser.raw().pipe(new LineTransform);
              out.on('readable', readableListener = function() {
                return resolver.resolve(out);
              });
              out.on('end', endListener = function() {
                return resolver.reject(new Error('Unable to run screencap command'));
              });
              return resolver.promise["finally"](function() {
                out.removeListener('end', endListener);
                return out.removeListener('readable', readableListener);
              });
            case Protocol.FAIL:
              return _this.parser.readError();
            default:
              return _this.parser.unexpected(reply, 'OKAY or FAIL');
          }
        };
      })(this));
    };

    return ScreencapCommand;

  })(Command);

  module.exports = ScreencapCommand;

}).call(this);
