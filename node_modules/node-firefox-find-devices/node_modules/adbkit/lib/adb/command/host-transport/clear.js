(function() {
  var ClearCommand, Command, Protocol,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Command = require('../../command');

  Protocol = require('../../protocol');

  ClearCommand = (function(_super) {
    __extends(ClearCommand, _super);

    function ClearCommand() {
      return ClearCommand.__super__.constructor.apply(this, arguments);
    }

    ClearCommand.prototype.execute = function(pkg) {
      this._send("shell:pm clear " + pkg);
      return this.parser.readAscii(4).then((function(_this) {
        return function(reply) {
          switch (reply) {
            case Protocol.OKAY:
              return _this.parser.searchLine(/^(Success|Failed)$/).then(function(result) {
                switch (result[0]) {
                  case 'Success':
                    return true;
                  case 'Failed':
                    _this.connection.end();
                    throw new Error("Package '" + pkg + "' could not be cleared");
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

    return ClearCommand;

  })(Command);

  module.exports = ClearCommand;

}).call(this);
