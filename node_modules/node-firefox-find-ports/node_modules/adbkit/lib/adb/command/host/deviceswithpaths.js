(function() {
  var Command, HostDevicesWithPathsCommand, Protocol,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Command = require('../../command');

  Protocol = require('../../protocol');

  HostDevicesWithPathsCommand = (function(_super) {
    __extends(HostDevicesWithPathsCommand, _super);

    function HostDevicesWithPathsCommand() {
      return HostDevicesWithPathsCommand.__super__.constructor.apply(this, arguments);
    }

    HostDevicesWithPathsCommand.prototype.execute = function() {
      this._send('host:devices-l');
      return this.parser.readAscii(4).then((function(_this) {
        return function(reply) {
          switch (reply) {
            case Protocol.OKAY:
              return _this._readDevices();
            case Protocol.FAIL:
              return _this.parser.readError();
            default:
              return _this.parser.unexpected(reply, 'OKAY or FAIL');
          }
        };
      })(this));
    };

    HostDevicesWithPathsCommand.prototype._readDevices = function() {
      return this.parser.readValue().then((function(_this) {
        return function(value) {
          return _this._parseDevices(value);
        };
      })(this));
    };

    HostDevicesWithPathsCommand.prototype._parseDevices = function(value) {
      var devices, id, line, path, type, _i, _len, _ref, _ref1;
      devices = [];
      if (!value.length) {
        return devices;
      }
      _ref = value.toString('ascii').split('\n');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        if (line) {
          _ref1 = line.split(/\s+/), id = _ref1[0], type = _ref1[1], path = _ref1[2];
          devices.push({
            id: id,
            type: type,
            path: path
          });
        }
      }
      return devices;
    };

    return HostDevicesWithPathsCommand;

  })(Command);

  module.exports = HostDevicesWithPathsCommand;

}).call(this);
