/*!
 * base-runner <https://github.com/jonschlinkert/base-runner>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var Base = require('base-methods');
var option = require('base-options');
var expand = require('expand-args');
var plugin = require('./plugins');
var utils = require('./lib/utils');

module.exports = function (Ctor, config) {
  if (typeof Ctor !== 'function') {
    config = Ctor;
    Ctor = Base;
  }

  config = createConfig(config);
  var method = config.method;
  var single = config.single;
  var plural = config.plural;

  function Runner(argv, options) {
    if (!(this instanceof Runner)) {
      return new Runner(argv, options);
    }

    Base.call(this);
    this.options = options || {};
    this.use(option());

    this.option('rename', config.rename);
    this.define('single', single);
    this.define('plural', plural);
    var opts = { single: single, plural: plural };

    this.use(plugin.register(opts));
    this.use(plugin.list(opts));
    this.use(plugin.run(opts));
    this.use(plugin.argv(opts))
    this.use(plugin.listeners(opts));

    this.base = new Ctor();
    this.base.define('runner', this);
    this.base.define(plural, {});

    // this.baseMiddleware(require('./middleware'))
    // this.baseTasks(require('./tasks'))
  }

  /**
   * Inherit `Base`
   */

  Base.extend(Runner);

  /**
   * Register base middleware. These are middleware functions
   * that are probably in a local directory, like `lib/middleware`
   */

  Runner.prototype.baseMiddleware = function(fns) {
    for (var fn in fns) {
      fns[fn](this.base, this.base, this);
    }
  };

  /**
   * Register base tasks These are task functions
   * that are probably in a local directory, like `lib/tasks`
   */

  Runner.prototype.baseTasks = function(tasks) {
    for (var key in tasks) {
      this.base.task(key, tasks[key](this.base, this.base, this));
    }
  };

  // Templates.prototype.create = function(name) {
  //   var collection = this.collection(name);
  //   this.views[name] = collection.views;
  //   this[name] = collection;

  //   return this[name];
  // };

  Runner.prototype.getMethod = function(method) {
    return function (name) {
      return this[plural][name];
    };
  };

  Runner.prototype.getApp = function(name) {
    return this[plural][name];
  };

  Runner.prototype.matchFile = function(name) {};
  Runner.prototype.getView = function(runner, name) {
    return this.getApp(runner).getView(name);
  };

  Runner.prototype.hasFile = function(name) {};
  Runner.prototype.lookup = function(name) {};
  Runner.prototype.rename = function(name) {};
  Runner.prototype.copy = function(name) {};

  Runner.prototype[single] = function(name) {
    return this.base[single](name);
  };

  Runner.prototype.build = function() {
    this.base.build.apply(this.base, arguments);
    return this;
  };

  Runner.prototype.hasGenerator = function(name) {
    return this[plural].hasOwnProperty(name);
  };

  Runner.prototype.hasTask = function(name) {
    return this.taskMap.indexOf(name) > -1;
  };

  /**
   * Expose `Runner`
   */

  return Runner;
};

function createConfig(config) {
  if (typeof config === 'undefined') {
    throw new TypeError('base-runner expected an options object');
  }

  config = utils.extend({method: ''}, config);
  if (!config.single) {
    config.single = utils.single(config.method);
  }
  if (!config.plural) {
    config.plural = utils.plural(config.method);
  }

  if (!config.method && !config.single && !config.plural) {
    var msg = 'expected "method", "single", or "plural" to be defined';
    throw new Error(msg);
  }
  return config;
}
