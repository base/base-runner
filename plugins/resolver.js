'use strict';

var fs = require('fs');
var path = require('path');
var resolveUp = require('resolve-up');
var utils = require('../lib/utils');
var cache = {};

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
  var opts = utils.extend({}, options);
  var res = [];
  if (opts.resolveGlobal !== false) {
    res = this.resolveUp(patterns, opts);
  }
  if (opts.resolveLocal !== false) {
    res = res.concat(this.resolveLocal(patterns, opts));
  }
  return res;
};

Resolver.prototype.resolveUp = function(patterns, options) {
  return resolveUp(patterns, utils.extend({}, options));
};

Resolver.prototype.resolveLocal = function(patterns, options) {
  var opts = utils.extend({cwd: ''}, options);
  return utils.glob.sync(patterns, opts).map(function (fp) {
    return path.join(opts.cwd, fp);
  });
};

/**
 * Resolve a config file.
 */

Resolver.prototype.resolveConfig = function(name, options) {
  var opts = utils.extend({cwd: ''}, options);
  var fp = path.join(opts.cwd, name);
  if (fs.existsSync(fp)) {
    return require(path.resolve(fp));
  }
  return null;
};

/**
 * Resolve an npm module.
 */

Resolver.prototype.resolveModule = function(name, options) {
  if (cache.hasOwnProperty(name)) {
    return cache[name];
  }

  var opts = utils.extend({cwd: ''}, options);
  var dir = path.join(opts.cwd, 'node_modules/', name);
  if (fs.existsSync(dir)) {
    var res = require(path.resolve(dir));
    cache[name] = res;
    return res;
  }

  return null;
  // var gm = utils.glob.sync('generate', {
  //   realpath: true,
  //   cwd: '@/'
  // });

  // if (!gm) return null;

  // res = require(gm[0]);
  // cache[name] = res;
  return res;
};

// Resolver.prototype.modules = function(patterns, options) {
//   var paths = resolveUp(patterns, options);
//   var len = paths.length, i = -1;
//   while (++i < len) {

//   }
// };

// Resolver.prototype.configs = function(patterns, options) {
//   return resolveUp(patterns, options);
// };

/**
 * Get the absolute filepath for a module.
 *
 * @param {String} `fp`
 * @return {String}
 */

Resolver.prototype.modulePath = function(fp) {
  var filepath = utils.resolve(fp);

  if (filepath.charAt(0) === '.') {
    filepath = path.resolve(filepath);
  }

  if (path.extname(filepath) === '') {
    filepath += path.sep;
  }

  return require.resolve(filepath);
};

/**
 * Expose `Resolver`
 */

module.exports = Resolver;
