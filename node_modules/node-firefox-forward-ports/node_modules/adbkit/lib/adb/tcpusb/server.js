(function() {
  var EventEmitter, Net, Server, Socket,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Net = require('net');

  EventEmitter = require('events').EventEmitter;

  Socket = require('./socket');

  Server = (function(_super) {
    __extends(Server, _super);

    function Server(client, serial, options) {
      this.client = client;
      this.serial = serial;
      this.options = options;
      this.connections = [];
      this.server = Net.createServer();
      this.server.on('error', (function(_this) {
        return function(err) {
          return _this.emit('error', err);
        };
      })(this));
      this.server.on('listening', (function(_this) {
        return function() {
          return _this.emit('listening');
        };
      })(this));
      this.server.on('close', (function(_this) {
        return function() {
          return _this.emit('close');
        };
      })(this));
      this.server.on('connection', (function(_this) {
        return function(conn) {
          var socket;
          socket = new Socket(_this.client, _this.serial, conn, _this.options);
          _this.connections.push(socket);
          return _this.emit('connection', socket);
        };
      })(this));
    }

    Server.prototype.listen = function() {
      this.server.listen.apply(this.server, arguments);
      return this;
    };

    Server.prototype.close = function() {
      this.server.close();
      return this;
    };

    Server.prototype.end = function() {
      var conn, _i, _len, _ref;
      _ref = this.connections;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        conn = _ref[_i];
        conn.end();
      }
      return this;
    };

    return Server;

  })(EventEmitter);

  module.exports = Server;

}).call(this);
