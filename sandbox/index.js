'use strict';

var Generate = require('./generate');
var option = require('base-options');
var Base = require('base-methods');
var utils = require('../lib/utils');
var env = require('../lib/env');

function generator(app, base, env) {

}

function Runner(options) {
  Base.call(this);
  this.options = options || {};
  this.apps = {};
  this.Base = this.options.Base || Generate;
  this.base = new this.Base();
  this.use(option());
  this.use(env());

  this.base.on('register', function(name, inst) {
    inst.fn.call(inst, inst, this.base, this);
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

Runner.prototype.registerUp = function(patterns, opts) {
  this.base.registerUp.apply(this.base, arguments);
  return this;
};

Runner.prototype.build = function(prop, cb) {
  var keys = prop.split(/\W+/);
  var name = keys[0];
  var tasks = keys[1].split(/[, ]+/);

  // var app = name !== 'base'
  //   ? this.base.generator(name)
  //   : this.base;

  var app = this.base.generator(name);
  return app.build(tasks, cb);
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
    var generator = this.base.generator(name);
    this.emit('runTasks', name, generator);
    generator.build(tasks, next);
  }.bind(this), cb);
  return this;
};

/**
 * Expose Runner
 */

module.exports = Runner;
