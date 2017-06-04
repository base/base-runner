'use strict';

var path = require('path');
var homedir = require('homedir-polyfill');
var utils = module.exports;

/**
 * Return true if `str` is a string with length greater than zero.
 */

utils.isString = function(str) {
  return str && typeof str === 'string';
};

/**
 * Logging utils
 */

utils.log = require('log-utils');
utils.color = utils.log.colors;
utils.timestamp = function() {
  var args = [].slice.call(arguments);
  args.unshift(utils.log.timestamp);
  console.error.apply(console, args);
};

/**
 * Get a home-relative filepath
 */

utils.homeRelative = function(filepath) {
  if (!utils.isString(filepath)) {
    throw new TypeError('expected filepath to be a string');
  }
  filepath = path.relative(homedir(), path.resolve(filepath));
  if (filepath.charAt(0) === '/') {
    filepath = filepath.slice(1);
  }
  return filepath;
};

/**
 * Return a formatted, home-relative config-file path.
 *
 * @param {String} `configName` Config file name
 * @param {String} `filepath`
 * @return {String}
 */

utils.configPath = function(msg, filepath) {
  var configPath = path.dirname(filepath) === process.cwd()
    ? path.basename(filepath)
    : utils.homeRelative(filepath);

  var fp = utils.color.green('~/' + configPath);
  utils.timestamp(msg + ' ' + fp);
};

/**
 * Expose `utils`
 */

module.exports = utils;
