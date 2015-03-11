(function() {
  var Command, Parser, Protocol, StartActivityCommand, StartServiceCommand,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Command = require('../../command');

  Protocol = require('../../protocol');

  Parser = require('../../parser');

  StartActivityCommand = require('./startactivity');

  StartServiceCommand = (function(_super) {
    __extends(StartServiceCommand, _super);

    function StartServiceCommand() {
      return StartServiceCommand.__super__.constructor.apply(this, arguments);
    }

    StartServiceCommand.prototype.execute = function(options) {
      var args;
      args = this._intentArgs(options);
      if (options.user || options.user === 0) {
        args.push('--user', this._escape(options.user));
      }
      return this._run('startservice', args);
    };

    return StartServiceCommand;

  })(StartActivityCommand);

  module.exports = StartServiceCommand;

}).call(this);
