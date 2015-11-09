'use strict';

var path = require('path');
var utils = require('../lib/utils');

/**
 * This is a `runner` plugin
 */

module.exports = function(options) {
  options = options || {};
  var single = options.single;
  // var Generator = options.Generator;

  return function(runner) {

    runner.define('register', function(name, options, fn) {
      if (typeof options === 'function') {
        fn = options;
        options = {};
      }
      this.base[single](name, options, fn);
      this.emit('register', name);
      return this;
    });

    runner.define('registerModule', function(filename, dir) {
      var config = this.resolveModule(filename, dir);
      this.register(config.appname, config, config.fn);
      return this;
    });

    runner.define('resolveModule', function(filename, dir) {
      var filepath = path.resolve(dir, filename);
      var config = {};
      config.Ctor = utils.resolveModule(dir);
      config.appname = utils.project(dir);
      config.path = dir;
      config.fn = require(filepath);
      return config;
    });

    runner.define('registerEach', function(filename, pattern, options) {
      utils.matchFiles(pattern, options).forEach(function(dir) {
        this.registerModule(filename, dir);
      }.bind(this));
      return this;
    });
  };
};
