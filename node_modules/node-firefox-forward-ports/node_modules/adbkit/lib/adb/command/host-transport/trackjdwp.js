(function() {
  var Command, EventEmitter, Parser, Promise, Protocol, TrackJdwpCommand,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EventEmitter = require('events').EventEmitter;

  Promise = require('bluebird');

  Command = require('../../command');

  Protocol = require('../../protocol');

  Parser = require('../../parser');

  TrackJdwpCommand = (function(_super) {
    var Tracker;

    __extends(TrackJdwpCommand, _super);

    function TrackJdwpCommand() {
      return TrackJdwpCommand.__super__.constructor.apply(this, arguments);
    }

    TrackJdwpCommand.prototype.execute = function() {
      this._send('track-jdwp');
      return this.parser.readAscii(4).then((function(_this) {
        return function(reply) {
          switch (reply) {
            case Protocol.OKAY:
              return new Tracker(_this);
            case Protocol.FAIL:
              return _this.parser.readError();
            default:
              return _this.parser.unexpected(reply, 'OKAY or FAIL');
          }
        };
      })(this));
    };

    Tracker = (function(_super1) {
      __extends(Tracker, _super1);

      function Tracker(command) {
        this.command = command;
        this.pids = [];
        this.pidMap = Object.create(null);
        this.reader = this.read()["catch"](Parser.PrematureEOFError, (function(_this) {
          return function(err) {
            return _this.emit('end');
          };
        })(this))["catch"](Promise.CancellationError, (function(_this) {
          return function(err) {
            _this.command.connection.end();
            return _this.emit('end');
          };
        })(this))["catch"]((function(_this) {
          return function(err) {
            _this.command.connection.end();
            _this.emit('error', err);
            return _this.emit('end');
          };
        })(this));
      }

      Tracker.prototype.read = function() {
        return this.command.parser.readValue().cancellable().then((function(_this) {
          return function(list) {
            var maybeEmpty, pids;
            pids = list.toString().split('\n');
            if (maybeEmpty = pids.pop()) {
              pids.push(maybeEmpty);
            }
            return _this.update(pids);
          };
        })(this));
      };

      Tracker.prototype.update = function(newList) {
        var changeSet, newMap, pid, _i, _j, _len, _len1, _ref;
        changeSet = {
          removed: [],
          added: []
        };
        newMap = Object.create(null);
        for (_i = 0, _len = newList.length; _i < _len; _i++) {
          pid = newList[_i];
          if (!this.pidMap[pid]) {
            changeSet.added.push(pid);
            this.emit('add', pid);
            newMap[pid] = pid;
          }
        }
        _ref = this.pids;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          pid = _ref[_j];
          if (!newMap[pid]) {
            changeSet.removed.push(pid);
            this.emit('remove', pid);
          }
        }
        this.pids = newList;
        this.pidMap = newMap;
        this.emit('changeSet', changeSet, newList);
        return this;
      };

      Tracker.prototype.end = function() {
        this.reader.cancel();
        return this;
      };

      return Tracker;

    })(EventEmitter);

    return TrackJdwpCommand;

  })(Command);

  module.exports = TrackJdwpCommand;

}).call(this);
