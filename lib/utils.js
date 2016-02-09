'use strict';

// var utils = require('lazy-cache')(require);
var utils = require('generator-util');
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('arr-diff', 'diff');
require('array-union', 'union');
require('define-property', 'define');
require('extend-shallow', 'extend');
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
require('resolve-glob', 'glob');
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


utils.fileKeys = [
  'base', 'basename', 'cwd', 'dir',
  'dirname', 'ext', 'extname', 'f',
  'file', 'filename', 'path', 'root',
  'stem'
];

utils.whitelist = ['emit', 'toc', 'layout'].concat(utils.fileKeys);

/**
 * Expose `utils`
 */

module.exports = utils;
