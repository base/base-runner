'use strict';

var fs = require('fs');
var path = require('path');
var glob = require('matched');
var async = require('async');
var unique = require('array-unique');
var option = require('base-options');
var Base = require('assemble-core');
var ask = require('assemble-ask');
var resolveUp = require('resolve-up');
var utils = require('../lib/utils');
var env = require('../lib/env');
var cache = {};

Base.prototype.generator = function(name, options) {
  if (typeof name === 'string' && arguments.length === 1) {
    return this.generators[name];
  }
  this.generators = this.generators || {};
  var opts = utils.extend({}, options);
  var inst = new Base(opts.options)
    .set(opts)
    .use(ask())
    .use(function(app) {
      app.handlers('onStream');
    });

  this.emit('register', name, inst);
  this.generators[name] = inst;
  return this.generators[name];
};
Base.prototype.resolve = function(patterns, opts) {
  var files = resolveUp(patterns, opts).concat(glob.sync(patterns, opts));
  return unique(files);
};
Base.prototype.register = function(name, options, fn) {
  if (!fn && utils.isObject(options) && options.fn) {
    this.generator(name, options);
    return this;
  }
  // this scenario is not handled yet
};

Base.prototype.registerGlob = function(patterns, opts) {
  var dirs = this.resolve(patterns, opts);
  this.apps = this.apps || {};
  var len = dirs.length, i = -1;

  while (++i < len) {
    var config = new Config(dirs[i], opts);
    this.apps[config.alias] = config;
    this.register(config.alias, config);
  }
  return this;
};

Base.prototype.registerLocal = function(patterns, opts) {
  this.apps = this.apps || {};

  var dirs = utils.glob.sync(patterns, opts);
  var len = dirs.length, i = -1;

  while (++i < len) {
    var config = new Config(dirs[i], opts);
    this.apps[config.alias] = config;
    this.register(config.alias, config);
  }
  return this;
};


function Runner(options) {
  Base.call(this);
  this.options = options || {};
  this.apps = {};
  this.Base = Base;
  this.base = new this.Base();
  this.use(option());
  this.use(ask());
  this.use(env());

  this.base.on('register', function(name, inst) {
    inst.fn.call(inst, inst, this.base, this.env);
  }.bind(this));
}
Base.extend(Runner);

Runner.prototype.resolve = function(patterns, opts) {
  return this.base.resolve(patterns, opts);
};

Runner.prototype.register = function(name, options, fn) {
  this.base.register.apply(this.base, arguments);
  return this;
};

Runner.prototype.registerGlob = function(patterns, opts) {
  this.base.registerGlob.apply(this.base, arguments);
  return this;
};


Runner.prototype.build = function(name, cb) {
  var keys = name.split(/\W+/);
  var app = this.base.generator(keys[0]);
  return app.build(keys[1], cb);
};

/**
 * From parsed argv:
 *
 * ```js
 * // generators or updaters, etc
 * apps: {
 *   foo: ['one', 'two'], // tasks
 *   bar: ['three']
 * }
 * ```
 */

Runner.prototype.runTasks = function(apps, cb) {
  utils.async.eachOf(apps, function(tasks, name, next) {
    console.log(name)
    var generator = this.base.generator(name);
    this.emit('run', name, generator);
    generator.build(tasks, next);
  }.bind(this), cb);
  return this;
};

function Config(fp, opts) {
  this.options = opts;
  this.configfile = fp;
  this.dir = path.dirname(fp);
  this.name = path.basename(this.dir);
  this.alias = utils.alias(this.name);
  this.Ctor = resolveModule(this.dir, 'generate', opts) || opts.Ctor;
  this.fn = require(fp);
}

function resolveModule(cwd, name, options) {
  if (cache.hasOwnProperty(name)) {
    return cache[name];
  }
  var opts = utils.extend({cwd: ''}, options);
  var dir = path.join(opts.cwd, 'node_modules/', name);
  if (fs.existsSync(dir)) {
    var res = require(path.resolve(dir));
    cache[name] = res;
    return res;
  }
  return null;
}

var runner = new Runner();

runner.registerGlob('generate-*/generate.js', {
  paths: ['examples/apps'],
  realpath: true,
  Ctor: Base,
  cwd: '',
  filter: function(fp) {
    return true;
  }
});

runner.build('foo:b', function(err) {
  if (err) return console.log(err);
  console.log('done!');
});

// var generators = {
//   foo: ['a', 'b'],
//   bar: ['b']
// };

// runner.on('run', function(name) {
//   console.log('running');
// });

// runner.runTasks(generators, function(err) {
//   if (err) return console.log(err);
//   console.log('done!');
// });

// runner.base.generator('foo').build('a', function(err) {
//   if (err) return console.log(err);
// });
