(function() {
  var Entry, Stats,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Stats = require('./stats');

  Entry = (function(_super) {
    __extends(Entry, _super);

    function Entry(name, mode, size, mtime) {
      this.name = name;
      Entry.__super__.constructor.call(this, mode, size, mtime);
    }

    Entry.prototype.toString = function() {
      return this.name;
    };

    return Entry;

  })(Stats);

  module.exports = Entry;

}).call(this);
