'use strict';

var path = require('path');
var async = require('async');
var utils = require('../utils');

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
