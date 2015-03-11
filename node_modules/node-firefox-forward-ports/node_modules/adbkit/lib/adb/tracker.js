(function() {
  var EventEmitter, Parser, Promise, Tracker,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EventEmitter = require('events').EventEmitter;

  Promise = require('bluebird');

  Parser = require('./parser');

  Tracker = (function(_super) {
    __extends(Tracker, _super);

    function Tracker(command) {
      this.command = command;
      this.deviceList = [];
      this.deviceMap = {};
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
          _this.emit('error', err);
          return _this.emit('end');
        };
      })(this));
    }

    Tracker.prototype.read = function() {
      return this.command._readDevices().cancellable().then((function(_this) {
        return function(list) {
          _this.update(list);
          return _this.read();
        };
      })(this));
    };

    Tracker.prototype.update = function(newList) {
      var changeSet, device, newMap, oldDevice, _i, _j, _len, _len1, _ref;
      changeSet = {
        removed: [],
        changed: [],
        added: []
      };
      newMap = {};
      for (_i = 0, _len = newList.length; _i < _len; _i++) {
        device = newList[_i];
        oldDevice = this.deviceMap[device.id];
        if (oldDevice) {
          if (oldDevice.type !== device.type) {
            changeSet.changed.push(device);
            this.emit('change', device, oldDevice);
          }
        } else {
          changeSet.added.push(device);
          this.emit('add', device);
        }
        newMap[device.id] = device;
      }
      _ref = this.deviceList;
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        device = _ref[_j];
        if (!newMap[device.id]) {
          changeSet.removed.push(device);
          this.emit('remove', device);
        }
      }
      this.emit('changeSet', changeSet);
      this.deviceList = newList;
      this.deviceMap = newMap;
      return this;
    };

    Tracker.prototype.end = function() {
      this.reader.cancel();
      return this;
    };

    return Tracker;

  })(EventEmitter);

  module.exports = Tracker;

}).call(this);
