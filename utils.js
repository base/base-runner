'use strict';

var path = require('path');

/**
 * Module dependencies
 */

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

// "base" plugins
require('composer-runtimes', 'runtimes');
require('base-resolver', 'resolver');
require('base-config', 'config');
require('base-argv', 'argv');
require('base-cli', 'cli');

// misc
require('extend-shallow', 'extend');
require('pascalcase', 'pascal');
require('isobject', 'isObject');
require('global-modules', 'gm');
require('resolve-dir');
require('is-absolute');
require('inflection');
require('resolve');
require('async');
require = fn;

utils.tryResolve = function(fp, cwd) {
  try {
    cwd = utils.resolveDir(cwd || process.cwd());
    return utils.resolve.sync(fp, {basedir: cwd});
  } catch (err) {}
  return null;
};

/**
 * Resolve module the module to use from the given cwd.
 *
 * @param {String} `name`
 * @return {String|Null}
 */

utils.resolveModule = function(name, cwd) {
  if (typeof name === 'undefined') {
    throw new TypeError('expected name to be a string');
  }
  name = utils.resolveDir(name);
  if (cwd && path.basename(cwd) === name) {
    var fp = utils.tryResolve(cwd);
    if (fp) return fp;
  }
  var main = utils.tryResolve(name, cwd)
    || utils.tryResolve(name, utils.gm);

  return main ? path.dirname(main) : null;
};

/**
 * Expose `utils` modules
 */

module.exports = utils;
