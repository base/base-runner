'use strict';

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('try-open');
require('define-property', 'define');
require('extend-shallow', 'extend');
require('minimist');
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
