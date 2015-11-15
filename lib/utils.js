'use strict';

var fs = require('fs');
var path = require('path');

/**
 * Lazily require module dependencies
 */

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Utils
 */

require('async');
require('object.omit', 'omit');
require('expand-args');
require('matched', 'glob');
require('extend-shallow', 'extend');
require('resolve-dir', 'resolve');
require('project-name', 'project');
require('get-value', 'get');
require('inflection');
require = fn;

/**
 * Singularize the given `name`
 */

utils.single = function(name) {
  return utils.inflection.singularize(name);
};

/**
 * Pluralize the given `name`
 */

utils.plural = function(name) {
  return utils.inflection.pluralize(name);
};

/**
 * Return the given value unchanged
 */

utils.identity = function(val) {
  return val;
};

/**
 * Cast `value` to an array
 */

utils.arrayify = function(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
};

/**
 * Pluralize the given `name`
 */

utils.moduleName = function(name) {
  return utils.inflection.pluralize(name);
};

/**
 * Rename an application instance
 */

utils.alias = function(fp, options) {
  options = options || {};
  if (typeof options.alias === 'function') {
    return options.alias(fp);
  }
  var name = path.basename(fp);
  return name.slice(name.indexOf('-') + 1);
};

/**
 * Resolve the correct updater module to instantiate.
 * If `update` exists in `node_modules` of the cwd,
 * then that will be used to create the instance,
 * otherwise this module will be used.
 */

utils.resolveModule = function(name, options) {
  var opts = utils.extend({cwd: ''}, options);
  var dir = path.join(opts.cwd, 'node_modules/', name);
  if (fs.existsSync(dir)) {
    return require(path.resolve(dir));
  }
  return null;
};

/**
 * Rename a filepath to the "alias" of the project.
 *
 * ```js
 * renameFn('updater-foo');
 * //=> 'foo'
 * ```
 */

utils.renameFn = function(filename, options) {
  if (options && typeof options.renameFn === 'function') {
    return options.rename(filename);
  }
  var runner = options.runner ? '^' + options.runner : '';
  var re = new RegExp(runner + '[-\\W_.]+');
  return filename.split(re).pop();
};

/**
 * Expose utils
 */

module.exports = utils;
