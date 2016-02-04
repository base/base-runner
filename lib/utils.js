'use strict';

var fs = require('fs');

/**
 * Module dependencies
 */

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('base-argv', 'argv');
require('base-cli', 'cli');
require('base-cwd', 'cwd');
require('base-pkg', 'pkg');
require('base-project', 'project');
require('base-runtimes', 'runtimes');
require('base-store', 'store');

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
 * Return true if a directory exists and is empty.
 *
 * @param  {*} val
 * @return {Array}
 */

utils.isEmpty = function(dir, fn) {
  var files;
  try {
    if (!utils.exists(dir)) {
      return false;
    }
    files = fs.readdirSync(dir);
    files = files.filter(fn || function(fp) {
      return !/\.DS_Store/i.test(fp);
    });
    return files.length === 0;
  } catch (err) {};
  return true;
};

/**
 * Expose `utils`
 */

module.exports = utils;
