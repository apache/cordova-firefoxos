(function() {
  var PullTransfer, Stream,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Stream = require('stream');

  PullTransfer = (function(_super) {
    __extends(PullTransfer, _super);

    function PullTransfer() {
      this.stats = {
        bytesTransferred: 0
      };
      PullTransfer.__super__.constructor.call(this);
    }

    PullTransfer.prototype.cancel = function() {
      return this.emit('cancel');
    };

    PullTransfer.prototype.write = function(chunk, encoding, callback) {
      this.stats.bytesTransferred += chunk.length;
      this.emit('progress', this.stats);
      return PullTransfer.__super__.write.call(this, chunk, encoding, callback);
    };

    return PullTransfer;

  })(Stream.PassThrough);

  module.exports = PullTransfer;

}).call(this);
