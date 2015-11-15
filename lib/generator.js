'use strict';

var use = require('use');
var path = require('path');
var define = require('define-property');
var get = require('get-value');
var set = require('set-value');
var utils = require('./utils');

/**
 * Create an instance of `Generator`, optionally passing
 * a default object to initialize with.
 *
 * ```js
 * var app = new Generator({
 *   path: 'foo.html'
 * });
 * ```
 * @param {Object} `app`
 * @api public
 */

function Generator(name, config, fn) {
  if (!(this instanceof Generator)) {
    return new Generator(config);
  }

  if (typeof config === 'function') {
    fn = config;
    config = {};
  }

  this.isGenerator = true;
  define(this, 'cache', {});
  config = config || {};
  config.fn = fn;

  for (var key in config) {
    if (!(key in this)) {
      this.set(key, config[key]);
    }
  }
  use(this);
}

/**
 * Set `key` on the instance with the given `value`.
 *
 * @param {String} `key`
 * @param {Object} `value`
 * @return {Object} Returns the instance for chaining
 */

Generator.prototype.set = function(key, value) {
  set(this, key, value);
  return this;
};

/**
 * Custom `inspect` method.
 */

// Generator.prototype.inspect = function() {
//   var name = this.name || 'Generator';
//   var inspect = '"' + (this.path || this.alias) + '"';
//   return '<' + name + ' ' + inspect + '>';
// };

/**
 * Get the `cwd` (current working directory) for the generator.
 */

define(Generator.prototype, 'cwd', {
  set: function(dir) {
    this.cache.cwd = dir;
  },
  get: function() {
    return this.cache.cwd || (this.cache.cwd = process.cwd());
  }
});

/**
 * Get the `dirname` for the generator.
 */

define(Generator.prototype, 'dirname', {
  set: function(dir) {
    this.path = path.join(dir, path.basename(this.path));
  },
  get: function() {
    return path.dirname(this.path);
  }
});

/**
 * Get the `basename` for the generator.
 */

define(Generator.prototype, 'basename', {
  set: function(basename) {
    this.path = path.join(path.dirname(this.path), basename);
  },
  get: function() {
    return path.basename(this.path);
  }
});

/**
 * Get the `filename` for the generator.
 */

define(Generator.prototype, 'filename', {
  set: function(filename) {
    this.path = path.join(path.dirname(this.path), filename + this.extname);
  },
  get: function() {
    return path.basename(this.path, this.extname);
  }
});

/**
 * Expose `Generator`
 */

module.exports = Generator;
