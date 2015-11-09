'use strict';

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Utils
 */

require('async');
require('object.omit', 'omit');
require('expand-args');
require('extend-shallow', 'extend');
require('inflection');
require = fn;

/**
 * Singularize the given `name`
 */

utils.single = function single(name) {
  return utils.inflection.singularize(name);
};

/**
 * Pluralize the given `name`
 */

utils.plural = function plural(name) {
  return utils.inflection.pluralize(name);
};

/**
 * Pluralize the given `name`
 */

utils.moduleName = function moduleName(name) {
  return utils.inflection.pluralize(name);
};

/**
 * Rename a filepath to the "nickname" of the project.
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
  return filename.split(/[-\W_.]+/).pop();
};

/**
 * Expose utils
 */

module.exports = utils;
