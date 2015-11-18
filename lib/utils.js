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

require('define-property', 'define');
require('extend-shallow', 'extend');
require('expand-object', 'expand');
require('project-name', 'project');
require('array-unique', 'unique');
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

function stringify(o, parent, res) {
  res = res || {};
  for (var key in o) {
    var val = o[key];

    if (key === 'base') {
      res[key] = Object.keys(val);
      continue;
    }
    var path = parent ? (parent + '.' + key) : key;
    if (typeof val === 'object' && !Array.isArray(val)) {
      stringify(val, key, res);
    } else if (val && typeof val === 'string') {
      res[path] = val.split(',');
    } else if (!val) {
      res.base = res.base || [];
      res.base.push(key);
    } else {
      res[path] = val;
    }
  }
  return res;
}

utils.toTasks = function(val) {
  if (!/\W/.test(val)) {
    return { base: [val] };
  }
  if (Array.isArray(val)) {
    return { base: val };
  }
  var obj = utils.expand(val);
  return stringify(obj);
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

  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
    fp = path.dirname(fp);
  }

  var name = path.basename(fp);
  return name.slice(name.indexOf('-') + 1);
};


utils.resolve = function(patterns, options) {
  var opts = utils.extend({cwd: '', realpath: true}, options);
  opts.cwd = utils.resolveDir(opts.cwd);

  var files = utils.resolveUp(patterns, opts);
  files = files.concat(utils.glob.sync(patterns, opts));
  return utils.unique(files);
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
