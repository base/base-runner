'use strict';

var utils = require('generator-util');
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('define-property', 'define');
require('extend-shallow', 'extend');
require('get-value', 'get');
require('inflection', 'inflect');
require('has-glob');
require('kind-of', 'typeOf');
require('map-schema', 'Schema');
require('merge-settings', 'Settings');
require('minimist');
require('mixin-deep', 'merge');
require('resolve-glob', 'glob');
require('set-value', 'set');
require('try-open');
require = fn;

/**
 * Return true if a filepath exists on the file system
 */

utils.exists = function(fp) {
  return fp && (typeof utils.tryOpen(fp, 'r') === 'number');
};

/**
 * Expose `utils`
 */

module.exports = utils;
