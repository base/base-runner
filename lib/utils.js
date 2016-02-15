'use strict';

var path = require('path');
var utils = require('generator-util');
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('ansi-magenta', 'magenta');
require('ansi-green', 'green');
require('arr-diff', 'diff');
require('array-union', 'union');
require('define-property', 'define');
require('extend-shallow', 'extend');
require('fancy-log', 'timestamp');
require('get-value', 'get');
require('inflection', 'inflect');
require('has-glob');
require('has-value');
require('kind-of', 'typeOf');
require('map-schema', 'Schema');
require('merge-settings', 'Settings');
require('minimist');
require('mixin-deep', 'merge');
require('omit-empty');
require('resolve-dir');
require('set-value', 'set');
require('try-open');
require = fn;

/**
 * Return true if value is falsey
 */

utils.isEmpty = function(val) {
  return !utils.hasValue(val);
};

/**
 * Return true if a filepath exists on the file system
 */

utils.exists = function(fp) {
  return fp && (typeof utils.tryOpen(fp, 'r') === 'number');
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

utils.whitelist = ['emit', 'toc', 'layout', 'set']
  .concat(utils.fileKeys);

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
 * Expose `utils`
 */

module.exports = utils;
