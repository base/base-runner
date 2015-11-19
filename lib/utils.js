'use strict';

var fs = require('fs');
var path = require('path');
var resolveCache = {};
var resolveModuleCache = {};
var modulePathCache = {};
var nameCache = {};

/**
 * Lazily require module dependencies
 */

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Utils
 */

require('base-tasks', 'tasks');
require('composer-runtimes', 'runtimes');
require('define-property', 'define');
require('extend-shallow', 'extend');
require('isobject', 'isObject');
require('set-value', 'set');
require('get-value', 'get');
require('inflection');
require('async');
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
 * Normalize config values to ensure that all of the necessary
 * properties are defined.
 */

utils.createConfig = function(config) {
  config = utils.extend({}, config);
  if (!config.method) {
    config.method = config.appname;
  }
  if (!config.single && config.method) {
    config.single = utils.single(config.method);
  }
  if (!config.plural && config.method) {
    config.plural = utils.plural(config.method);
  }
  return config;
};

/**
 * Returns true if the give value is a simple string or array of
 * tasks (e.g. not a pattern that might be parsed into multiple
 * tasks)
 *
 * @param {String|Array} `tasks`
 * @return {Boolean}
 */

utils.isSimpleTask = function(tasks) {
  tasks = utils.arrayify(tasks);
  var len = tasks.length;
  while (len--) {
    if (typeof tasks[len] !== 'string' || /\W/.test(tasks[len])) {
      return false;
    }
  }
  return true;
};

/**
 * Cast `value` to an array
 */

utils.arrayify = function(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
};

/**
 * Expose utils
 */

module.exports = utils;
