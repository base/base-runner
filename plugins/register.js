'use strict';

var path = require('path');
var extend = require('extend-shallow');
var Generator = require('../lib/generator');
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
      var files = resolver.resolve(patterns, options);
      var len = files.length, i = -1;
      while (++i < len) {
        this.emit('resolve', files[i], options);
      }
      return files;
    });

    this.define('register', function(name, options, fn) {
      if (typeof options === 'function') {
        fn = options;
        options = {};
      }

      var opts = extend({cwd: ''}, config, options);
      if (typeof fn === 'function') {
        var cfg = new Generator(name, opts, fn);
        console.log(cfg)
      }

      this.base[single](name, opts, fn);
      this.emit('register', name);
      return this;
    });

    this.define('registerFile', function(filepath, options) {
      var opts = extend({cwd: ''}, config, options);
      var cwd = path.dirname(filepath);
      var basename = path.basename(cwd);
      var fn = require(path.resolve(filepath));

      if (typeof fn === 'function') {
        var cfg = new Generator(name, opts, fn);
        console.log(cfg)
      }

      this.base[single](name, opts, fn);
      this.emit('register', name);
      return this;
    });

    // this.define('registerEach', function(filename, pattern, options) {
    //   var opts = extend({}, config, options);
    //   var dirs = this.resolve(pattern, opts);
    //   var len = dirs.length, i = -1;

    //   while (++i < len) {
    //     this.registerModule(filename, {cwd: dirs[i]});
    //   }
    //   return this;
    // });

    // this.define('registerModule', function(filename, options) {
    //   var opts = extend({}, config, options);
    //   var app = this.resolveModule(filename, {cwd: opts.cwd});
    //   this.register(app.alias, app, app.fn);
    //   return this;
    // });

    // this.define('resolveModule', function(filename, options) {
    //   return new Config(filename, extend({}, config, options));
    // });
  };


  function Config(filename, opts) {
    this.configfile = path.resolve(opts.cwd, filename);

    var basename = path.basename(opts.cwd);
    this.appname = opts.appname || utils.project(opts.cwd);
    this.alias = utils.renameFn(basename, opts);
    this.Ctor = resolver.resolveModule(config.parent, opts);

    this.path = opts.cwd;
    this.fn = opts.fn || require(this.configfile);

    // this.inspect = function() {
    //   return {
    //     appname: this.appname,
    //     alias: this.alias,
    //     path: this.path,
    //     fn: this.fn
    //   }
    // };
  }
};

