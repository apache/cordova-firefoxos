(function() {
  var Command, GetDevicePathCommand, Protocol,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Command = require('../../command');

  Protocol = require('../../protocol');

  GetDevicePathCommand = (function(_super) {
    __extends(GetDevicePathCommand, _super);

    function GetDevicePathCommand() {
      return GetDevicePathCommand.__super__.constructor.apply(this, arguments);
    }

    GetDevicePathCommand.prototype.execute = function(serial) {
      this._send("host-serial:" + serial + ":get-devpath");
      return this.parser.readAscii(4).then((function(_this) {
        return function(reply) {
          switch (reply) {
            case Protocol.OKAY:
              return _this.parser.readValue().then(function(value) {
                return value.toString();
              });
            case Protocol.FAIL:
              return _this.parser.readError();
            default:
              return _this.parser.unexpected(reply, 'OKAY or FAIL');
          }
        };
      })(this));
    };

    return GetDevicePathCommand;

  })(Command);

  module.exports = GetDevicePathCommand;

}).call(this);
