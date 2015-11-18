'use strict';

var Base = require('assemble-core');
var utils = require('../lib/utils');
var Config = require('./config');

function Generate(options, env) {
  Base.call(this);
  this.options = options || {};
  this.generators = {};
  this.env = env;
}

/**
 * Inherit Base
 */

Base.extend(Generate);

/**
 * Add generate `name` with the given `config`
 */

Generate.prototype.invoke = function(config) {
  config = config || {};
  var app = new Generate(config.options, this.env)
    .set(config);

  app.fn.call(app, app, this, this.env);
  return app;
};

// function Generator(generate, config) {
//   config = config || {};
//   var app = new Generate(config.options, this.env)
//     .set(config);

//   app.fn.call(app, app, this, this.env);
// }


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

Generate.prototype.runTasks = function(apps, cb) {
  utils.async.eachOf(apps, function(tasks, name, next) {
    var generator = this.generators[name];
    this.emit('runTasks', name, generator);
    generator.build(tasks, next);
  }.bind(this), cb);
  return this;
};

/**
 * Add generate `name` with the given `config`
 */

Generate.prototype.generator = function(name, config) {
  if (typeof name === 'string' && arguments.length === 1) {
    return this.generators[name];
  }
  // var generator = new Generator(config);
  var generator = this.invoke(config);
  this.emit('generator', name, generator);
  this.generators[name] = generator;
  return generator;
};

Generate.prototype.register = function(name, options, fn) {
  if (utils.hasGlob(name)) {
    utils.resolve(name, options).forEach(function(fp) {
      this.generator(fp, options);
    }.bind(this));
    return this;
  }
  if (!fn && utils.isObject(options) && options.fn) {
    this.generator(name, options);
    return this;
  }
  var config = new Config(name, options);
  this.generator(config.alias, config);
  return this;
};

/**
 * Expose Generate
 */

module.exports = Generate;


var generate = new Generate();

generate.register(['generate-*/generate.js'], {
  paths: ['examples/apps'],
  realpath: true,
  // Base: Assemble,
  // cwd: '',
  // filter: function(fp) {
  //   return true;
  // }
});


console.log(generate)
