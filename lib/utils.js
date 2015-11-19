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

require('composer-runtimes', 'runtimes');
require('define-property', 'define');
require('extend-shallow', 'extend');
require('expand-object', 'expand');
require('project-name', 'project');
require('array-unique', 'unique');
require('arr-flatten', 'flatten');
require('union-value', 'union');
require('isobject', 'isObject');
require('object.omit', 'omit');
require('set-value', 'set');
require('get-value', 'get');
require('matched', 'glob');
require('resolve-dir');
require('expand-args');
require('resolve-up');
require('inflection');
require('has-glob');
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
  if (typeof config === 'undefined') {
    throw new TypeError('base-runner expected an options object');
  }
  config = utils.extend({}, config);
  if (!config.single && config.method) {
    config.single = utils.single(config.method);
  }
  if (!config.plural && config.method) {
    config.plural = utils.plural(config.method);
  }

  if (!config.method && !config.single && !config.plural) {
    var msg = 'expected "method", "single", or "plural" to be defined';
    throw new Error(msg);
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
 * Pluralize the given `name`
 */

utils.moduleName = function(name) {
  return utils.inflection.pluralize(name);
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
    return options.renameFn(filename);
  }
  var strip = options.strip ? '^' + options.strip : '';
  var re = new RegExp(strip + '[-\\W_.]+');
  return filename.split(re).pop();
};

/**
 * Rename a filepath to the "alias" of the project.
 *
 * ```js
 * nameFn('updater-foo');
 * //=> 'foo'
 * ```
 */

utils.nameFn = function(fp, options) {
  if (options && typeof options.nameFn === 'function') {
    return options.nameFn(fp);
  }
  if (nameCache.hasOwnProperty(fp)) {
    return nameCache[fp];
  }
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
    fp = path.dirname(fp);
  }
  var name = path.basename(fp, path.extname(fp));
  if (name === '.') {
    name = utils.project(process.cwd());
  }
  nameCache[fp] = name;
  return name;
};

/**
 * Get the alias to use based on a filepath or "full name".
 */

utils.aliasFn = function(fp, options) {
  options = options || {};
  if (typeof options.aliasFn === 'function') {
    return options.aliasFn(fp);
  }
  var name = utils.nameFn(fp, options);
  return name.slice(name.indexOf('-') + 1);
};

utils.resolve = function(patterns, options) {
  patterns = utils.arrayify(patterns);
  var key = patterns.join('');
  if (resolveCache.hasOwnProperty(key)) {
    return resolveCache[key];
  }

  var opts = utils.extend({cwd: '', realpath: true}, options);
  opts.cwd = utils.resolveDir(opts.cwd);
  var files = [];
  if (opts.resolveGlobal === true) {
    files = files.concat(utils.resolveUp(patterns, opts));
  }
  if (opts.resolveLocal === true) {
    files = files.concat(utils.glob.sync(patterns, opts));
  }

  files = utils.unique(files);
  resolveCache[key] = files;
  return files;
};

/**
 * Resolve the correct updater module to instantiate.
 * If `update` exists in `node_modules` of the cwd,
 * then that will be used to create the instance,
 * otherwise this module will be used.
 */

utils.resolveModule = function(cwd, name, options) {
  if (resolveModuleCache.hasOwnProperty(name)) {
    return resolveModuleCache[name];
  }

  var opts = utils.extend({cwd: ''}, options);
  var dir = path.resolve(cwd || opts.cwd, 'node_modules', name, 'index.js');
  if (fs.existsSync(dir)) {
    var modulePath = utils.modulePath(dir);
    resolveModuleCache[name] = modulePath;
    return modulePath;
  }

  var paths = utils.resolveUp(name + '/index.js');
  if (paths.length) {
    resolveModuleCache[name] = paths[0];
    return paths[0];
  }
  return null;
};

/**
 * Get the absolute filepath for a module.
 *
 * @param {String} `fp`
 * @return {String}
 */

utils.modulePath = function(fp) {
  if (modulePathCache.hasOwnProperty(fp)) {
    return modulePathCache[fp];
  }
  var filepath = utils.resolveDir(fp);

  if (filepath.charAt(0) === '.') {
    filepath = path.resolve(filepath);
  }

  if (path.extname(filepath) === '') {
    filepath += path.sep;
  }
  var res = require.resolve(filepath);
  modulePathCache[fp] = res;
  return res;
};

/**
 * Expose utils
 */

module.exports = utils;
