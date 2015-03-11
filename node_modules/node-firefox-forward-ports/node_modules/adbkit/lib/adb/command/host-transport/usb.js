(function() {
  var Command, LineTransform, Protocol, UsbCommand,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Command = require('../../command');

  Protocol = require('../../protocol');

  LineTransform = require('../../linetransform');

  UsbCommand = (function(_super) {
    var RE_OK;

    __extends(UsbCommand, _super);

    function UsbCommand() {
      return UsbCommand.__super__.constructor.apply(this, arguments);
    }

    RE_OK = /restarting in/;

    UsbCommand.prototype.execute = function() {
      this._send('usb:');
      return this.parser.readAscii(4).then((function(_this) {
        return function(reply) {
          switch (reply) {
            case Protocol.OKAY:
              return _this.parser.readAll().then(function(value) {
                if (RE_OK.test(value)) {
                  return true;
                } else {
                  throw new Error(value.toString().trim());
                }
              });
            case Protocol.FAIL:
              return _this.parser.readError();
            default:
              return _this.parser.unexpected(reply, 'OKAY or FAIL');
          }
        };
      })(this));
    };

    return UsbCommand;

  })(Command);

  module.exports = UsbCommand;

}).call(this);
