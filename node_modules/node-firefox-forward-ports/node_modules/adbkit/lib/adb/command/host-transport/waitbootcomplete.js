(function() {
  var Command, Protocol, WaitBootCompleteCommand, debug,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  debug = require('debug')('adb:command:waitboot');

  Command = require('../../command');

  Protocol = require('../../protocol');

  WaitBootCompleteCommand = (function(_super) {
    __extends(WaitBootCompleteCommand, _super);

    function WaitBootCompleteCommand() {
      return WaitBootCompleteCommand.__super__.constructor.apply(this, arguments);
    }

    WaitBootCompleteCommand.prototype.execute = function() {
      this._send('shell:while getprop sys.boot_completed 2>/dev/null; do sleep 1; done');
      return this.parser.readAscii(4).then((function(_this) {
        return function(reply) {
          switch (reply) {
            case Protocol.OKAY:
              return _this.parser.searchLine(/^1$/)["finally"](function() {
                return _this.connection.end();
              }).then(function() {
                return true;
              });
            case Protocol.FAIL:
              return _this.parser.readError();
            default:
              return _this.parser.unexpected(reply, 'OKAY or FAIL');
          }
        };
      })(this));
    };

    return WaitBootCompleteCommand;

  })(Command);

  module.exports = WaitBootCompleteCommand;

}).call(this);
