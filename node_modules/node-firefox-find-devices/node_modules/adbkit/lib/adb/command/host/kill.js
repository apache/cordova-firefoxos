(function() {
  var Command, HostKillCommand, Protocol,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Command = require('../../command');

  Protocol = require('../../protocol');

  HostKillCommand = (function(_super) {
    __extends(HostKillCommand, _super);

    function HostKillCommand() {
      return HostKillCommand.__super__.constructor.apply(this, arguments);
    }

    HostKillCommand.prototype.execute = function() {
      this._send('host:kill');
      return this.parser.readAscii(4).then((function(_this) {
        return function(reply) {
          switch (reply) {
            case Protocol.OKAY:
              return true;
            case Protocol.FAIL:
              return _this.parser.readError();
            default:
              return _this.parser.unexpected(reply, 'OKAY or FAIL');
          }
        };
      })(this));
    };

    return HostKillCommand;

  })(Command);

  module.exports = HostKillCommand;

}).call(this);
