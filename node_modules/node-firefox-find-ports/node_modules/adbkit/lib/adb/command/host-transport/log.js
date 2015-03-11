(function() {
  var Command, LogCommand, Protocol,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Command = require('../../command');

  Protocol = require('../../protocol');

  LogCommand = (function(_super) {
    __extends(LogCommand, _super);

    function LogCommand() {
      return LogCommand.__super__.constructor.apply(this, arguments);
    }

    LogCommand.prototype.execute = function(name) {
      this._send("log:" + name);
      return this.parser.readAscii(4).then((function(_this) {
        return function(reply) {
          switch (reply) {
            case Protocol.OKAY:
              return _this.parser.raw();
            case Protocol.FAIL:
              return _this.parser.readError();
            default:
              return _this.parser.unexpected(reply, 'OKAY or FAIL');
          }
        };
      })(this));
    };

    return LogCommand;

  })(Command);

  module.exports = LogCommand;

}).call(this);
