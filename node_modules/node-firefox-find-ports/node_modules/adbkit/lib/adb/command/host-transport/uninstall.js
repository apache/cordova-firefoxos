(function() {
  var Command, Protocol, UninstallCommand,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Command = require('../../command');

  Protocol = require('../../protocol');

  UninstallCommand = (function(_super) {
    __extends(UninstallCommand, _super);

    function UninstallCommand() {
      return UninstallCommand.__super__.constructor.apply(this, arguments);
    }

    UninstallCommand.prototype.execute = function(pkg) {
      this._send("shell:pm uninstall " + pkg + " 2>/dev/null");
      return this.parser.readAscii(4).then((function(_this) {
        return function(reply) {
          switch (reply) {
            case Protocol.OKAY:
              return _this.parser.readAscii(7).then(function(reply) {
                switch (reply) {
                  case 'Success':
                  case 'Failure':
                    return true;
                  default:
                    return _this.parser.unexpected(reply, "'Success' or 'Failure'");
                }
              });
            case Protocol.FAIL:
              return _this.parser.readError();
            default:
              return _this.parser.unexpected(reply, "OKAY or FAIL");
          }
        };
      })(this));
    };

    return UninstallCommand;

  })(Command);

  module.exports = UninstallCommand;

}).call(this);
