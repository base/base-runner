'use strict';

var path = require('path');
var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('ansi-green', 'green');
require('ansi-magenta', 'magenta');
require('arr-diff', 'diff');
require('arr-flatten', 'flatten');
require('array-union', 'union');
require('define-property', 'define');
require('expand');
require('extend-shallow', 'extend');
require('fancy-log', 'timestamp');
require('generator-util', 'gutil');
require('get-value', 'get');
require('has-glob');
require('has-value');
require('inflection', 'inflect');
require('kind-of', 'typeOf');
require('map-schema', 'Schema');
require('merge-settings', 'Settings');
require('minimist');
require('mixin-deep', 'merge');
require('omit-empty');
require('resolve-dir');
require('resolve-glob', 'glob');
require('set-value', 'set');
require('try-open', 'exists');
require = fn;

/**
 * Used to camelcase the name to be stored on the `lazy` object.
 *
 * @param  {String} `str` String containing `_`, `.`, `-` or whitespace that will be camelcased.
 * @return {String} camelcased string.
 */

utils.camelcase = function camelcase(str) {
  if (str.length === 1) {
    return str.toLowerCase();
  }
  str = str.replace(/^[\W_]+|[\W_]+$/g, '').toLowerCase();
  return str.replace(/[\W_]+(\w|$)/g, function(_, ch) {
    return ch.toUpperCase();
  });
};

/**
 * Return true if value is false, undefined, null, an empty array
 * or empty object.
 */

utils.isEmpty = function(val) {
  return !utils.hasValue(val);
};

/**
 * Return true if value is an object
 */

utils.isObject = function(val) {
  return utils.typeOf(val) === 'object';
};

/**
 * Cast `val` to an array
 *
 * @param  {String|Array} `val`
 * @return {Array}
 */

utils.arrayify = function(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
};

/**
 * Get a home-relative filepath
 */

utils.homeRelative = function(fp) {
  if (typeof fp === 'undefined') {
    throw new TypeError('utils.homeRelative expected filepath to be a string');
  }
  var dir = path.resolve(utils.resolveDir(fp));
  var home = path.resolve(utils.resolveDir('~/'));
  fp = path.relative(home, dir);
  if (fp.charAt(0) === '/') {
    fp = fp.slice(1);
  }
  return fp;
};

/**
 * Returns true if (only) the `default` task is defined
 *
 * @param {Object} `opts`
 * @return {Boolean}
 */

utils.isDefaultTask = function(opts) {
  return opts.tasks
    && opts.tasks.length === 1
    && opts.tasks[0] === 'default';
};

/**
 * File-related properties. Passed to [expand-args]
 * to ensure that no undesired escaping or processing
 * is done on filepath arguments.
 */

utils.fileKeys = [
  'base', 'basename', 'cwd', 'dir',
  'dirname', 'ext', 'extname', 'f',
  'file', 'filename', 'path', 'root',
  'stem'
];

/**
 * Whitelisted flags: these flags can be passed along with task
 * arguments. To run tasks with any flags, pass `--run`
 */

utils.whitelist = [
  'ask',
  'data',
  'emit',
  'force',
  'init',
  'layout',
  'option',
  'options',
  'readme',
  'set',
  'toc',
  'verbose'
].concat(utils.fileKeys);

/**
 * Return true if the given object has whitelisted keys.
 *
 * @param {Object} argv
 * @return {Boolean}
 */

utils.isWhitelisted = function(argv) {
  var keys = utils.whitelist;
  for (var key in argv) {
    if (~keys.indexOf(key)) return true;
  }
  return false;
};

/**
 * Try to require the given module `name`
 *
 * @param {String} `name`
 */

/**
 * Try to require a module, fail silently if not found.
 */

utils.tryRequire = function(name, cwd) {
  try {
    return require(name);
  } catch (err) {
    console.log(err);
  }

  try {
    return require(path.resolve(cwd || process.cwd(), name));
  } catch (err) {
    console.log(err);
    if (err.code !== 'MODULE_NOT_FOUND') {
      throw err;
    }
  }
};

/**
 * Expose `utils`
 */

module.exports = utils;
