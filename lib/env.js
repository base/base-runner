'use strict';

var path = require('path');
var utils = require ('./utils');

function Env(options) {
  this.define('options', options || {});
}

Env.prototype.define = function(key, value) {
  utils.define(this, key, value);
  return this;
};

Env.prototype.set = function(key, value) {
  utils.set(this, key, value);
  return this;
};

Env.prototype.get = function(key) {
  return utils.get(this, key);
};

utils.define(Env.prototype, 'cwd', {
  set: function(dir) {
    this.cache.cwd = dir;
  },
  get: function() {
    return this.cache.cwd || process.cwd();
  }
});

utils.define(Env.prototype, 'pkg', {
  set: function() {
    throw new Error('env.pkg is a getter and cannot be set directly.');
  },
  get: function() {
    if (!this.cache.pkg) {
      this.cache.pkg = require(path.resolve(this.cwd, 'package.json'));
    }
    return this.cache.pkg;
  }
});

/**
 * Expose `Env`
 */

module.exports = function(options) {
  return function(app) {
    var opts = utils.extend({}, this.options, options);
    app.define('env', new Env(opts));
  };
};
