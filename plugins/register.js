'use strict';

var path = require('path');
var extend = require('extend-shallow');
var Resolver = require('./resolver');
var utils = require('../lib/utils');

/**
 * This is a `runner` plugin
 */

module.exports = function(config) {
  config = config || {};
  var single = config.single;
  // var Generator = options.Generator;

  var resolver = new Resolver(config);

  return function(runner) {
    config = extend({}, runner.options, config);

    this.define('resolve', function(patterns, options) {
      return resolver.resolve(patterns, options);
    });

    this.define('register', function(name, options, fn) {
      if (typeof options === 'function') {
        fn = options;
        options = {};
      }
      if (typeof options === 'string') {
        return this.registerEach.apply(this, arguments);
      }

      var opts = extend({cwd: ''}, config, options);
      if (typeof fn === 'function') {
        opts.fn = fn;
        var cfg = new Config(name, opts);
        console.log(name)
      }

      this.base[single](name, opts, fn);
      this.emit('register', name);
      return this;
    });

    this.define('registerEach', function(filename, pattern, options) {
      var opts = extend({}, config, options);
      var dirs = this.resolve(pattern, opts);
      var len = dirs.length, i = -1;

      while (++i < len) {
        this.registerModule(filename, {cwd: dirs[i]});
      }
      return this;
    });

    this.define('registerModule', function(filename, options) {
      var opts = extend({}, config, options);
      var app = this.resolveModule(filename, {cwd: opts.cwd});
      this.register(app.nickname, app, app.fn);
      return this;
    });

    this.define('resolveModule', function(filename, options) {
      return new Config(filename, extend({}, config, options));
    });
  };


  function Config(filename, opts) {
    var filepath = path.resolve(opts.cwd, filename);
    var basename = path.basename(path.dirname(filepath));
    console.log(basename)
    this.appname = utils.project(opts.cwd);
    this.nickname = utils.renameFn(basename, opts);
    this.Ctor = resolver.resolveModule(config.parent, opts);

    this.path = opts.cwd;
    this.fn = opts.fn;

    if (typeof this.fn !== 'function') {
      this.fn = require(filepath);
    }

    this.inspect = function() {
      return {
        appname: this.appname,
        nickname: this.nickname,
        path: this.path,
        fn: this.fn
      }
    };
  }
};

