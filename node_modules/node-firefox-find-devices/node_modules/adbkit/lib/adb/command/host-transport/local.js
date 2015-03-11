(function() {
  var Command, LocalCommand, Protocol,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Command = require('../../command');

  Protocol = require('../../protocol');

  LocalCommand = (function(_super) {
    __extends(LocalCommand, _super);

    function LocalCommand() {
      return LocalCommand.__super__.constructor.apply(this, arguments);
    }

    LocalCommand.prototype.execute = function(path) {
      this._send(/:/.test(path) ? path : "localfilesystem:" + path);
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

    return LocalCommand;

  })(Command);

  module.exports = LocalCommand;

}).call(this);
