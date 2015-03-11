(function() {
  var Command, HostTransportCommand, Protocol,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Command = require('../../command');

  Protocol = require('../../protocol');

  HostTransportCommand = (function(_super) {
    __extends(HostTransportCommand, _super);

    function HostTransportCommand() {
      return HostTransportCommand.__super__.constructor.apply(this, arguments);
    }

    HostTransportCommand.prototype.execute = function(serial) {
      this._send("host:transport:" + serial);
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

    return HostTransportCommand;

  })(Command);

  module.exports = HostTransportCommand;

}).call(this);
