(function() {
  var Command, MonkeyCommand, Promise, Protocol,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Promise = require('bluebird');

  Command = require('../../command');

  Protocol = require('../../protocol');

  MonkeyCommand = (function(_super) {
    __extends(MonkeyCommand, _super);

    function MonkeyCommand() {
      return MonkeyCommand.__super__.constructor.apply(this, arguments);
    }

    MonkeyCommand.prototype.execute = function(port) {
      this._send("shell:EXTERNAL_STORAGE=/data/local/tmp monkey --port " + port + " -v");
      return this.parser.readAscii(4).then((function(_this) {
        return function(reply) {
          switch (reply) {
            case Protocol.OKAY:
              return _this.parser.searchLine(/^:Monkey:/).timeout(1000).then(function() {
                return _this.parser.raw();
              })["catch"](Promise.TimeoutError, function(err) {
                return _this.parser.raw();
              });
            case Protocol.FAIL:
              return _this.parser.readError();
            default:
              return _this.parser.unexpected(reply, 'OKAY or FAIL');
          }
        };
      })(this));
    };

    return MonkeyCommand;

  })(Command);

  module.exports = MonkeyCommand;

}).call(this);
