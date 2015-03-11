(function() {
  var Command, ListForwardsCommand, Protocol,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Command = require('../../command');

  Protocol = require('../../protocol');

  ListForwardsCommand = (function(_super) {
    __extends(ListForwardsCommand, _super);

    function ListForwardsCommand() {
      return ListForwardsCommand.__super__.constructor.apply(this, arguments);
    }

    ListForwardsCommand.prototype.execute = function(serial) {
      this._send("host-serial:" + serial + ":list-forward");
      return this.parser.readAscii(4).then((function(_this) {
        return function(reply) {
          switch (reply) {
            case Protocol.OKAY:
              return _this.parser.readValue().then(function(value) {
                return _this._parseForwards(value);
              });
            case Protocol.FAIL:
              return _this.parser.readError();
            default:
              return _this.parser.unexpected(reply, 'OKAY or FAIL');
          }
        };
      })(this));
    };

    ListForwardsCommand.prototype._parseForwards = function(value) {
      var forward, forwards, local, remote, serial, _i, _len, _ref, _ref1;
      forwards = [];
      _ref = value.toString().split('\n');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        forward = _ref[_i];
        if (forward) {
          _ref1 = forward.split(/\s+/), serial = _ref1[0], local = _ref1[1], remote = _ref1[2];
          forwards.push({
            serial: serial,
            local: local,
            remote: remote
          });
        }
      }
      return forwards;
    };

    return ListForwardsCommand;

  })(Command);

  module.exports = ListForwardsCommand;

}).call(this);
