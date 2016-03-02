'use strict';

var path = require('path');
var async = require('async');
var utils = require('../utils');

/**
 * Define plugins to load. Value can be a string or array of module names.
 *
 * _(Modules must be locally installed and listed in `dependencies` or
 * `devDependencies`)_.
 *
 * ```json
 * {"verb":  {"use": ["base-option", "base-data"]}}
 * ```
 * @name use
 * @api public
 */

module.exports = function(app) {
  return function(arr, key, config, cb) {
    var cwd = app.cwd || process.cwd();

    if (typeof arr === 'string') {
      arr = arr.split(',');
    }

    async.each(arr, function(name, next) {
      var fn = utils.tryRequire(name, cwd);
      if (typeof fn === 'function') {
        app.use(fn);
      }
      next();
    }, cb);
  };
};
