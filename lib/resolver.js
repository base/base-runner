'use strict';

var path = require('path');
var resolveUp = require('resolve-up');
var utils = require('./utils');

/**
 * Expose `Resolver`
 */

module.exports = Resolver;

/**
 * Create an instance of `Resolver` with the given `options`.
 *
 * ```js
 * var resolver = new Resolver();
 * ```
 * @param {Object} `options`
 * @api public
 */

function Resolver(options) {
  this.options = options || {};
}

/**
 * Resolves locally- and globally-installed npm modules that
 * match the given `patterns` and `options`.
 *
 * @param {String|Array} `patterns`
 * @param {Object} `options`
 * @return {Array}
 * @api public
 */

Resolver.prototype.resolve = function(patterns, options) {
  return resolveUp(patterns, options);
};

Resolver.prototype.modules = function(patterns, options) {
  var paths = resolveUp(patterns, options);
  var len = paths.length, i = -1;
  while (++i < len) {

  }
};

Resolver.prototype.configs = function(patterns, options) {
  return resolveUp(patterns, options);
};

/**
 * Get the absolute filepath for a module.
 *
 * @param {String} `fp`
 * @return {String}
 */

Resolver.prototype.modulePath = function(fp) {
  var filepath = utils.resolveDir(fp);

  if (filepath.slice(0, 2) === './') {
    filepath = path.resolve(filepath);
  }

  if (path.extname(filepath) === '') {
    filepath += path.sep;
  }

  return require.resolve(filepath);
};
