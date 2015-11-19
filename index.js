'use strict';

var path = require('path');
var red = require('ansi-red');
var assert = require('assert');
var runtimes = require('composer-runtimes');
var toTasks = require('./lib/to-tasks');
var utils = require('./lib/utils');
var env = require('./lib/env');

function create(Base, child, config) {
  if (utils.isObject(Base)) {
    child = Base;
    Base = require('base-methods');
    config = {};
  }

  config = utils.createConfig(config);
  var proto = Base.prototype;
  var method = config.method || 'app';
  var plural = config.plural || 'apps';

  /**
   * Create an instance of Runner with the given options.
   *
   * @param {Object} `options`
   * @param {Object} `parent`
   * @param {Function} `fn`
   */

  function Runner(options, parent, fn) {
    if (typeof options === 'function') {
      return new Runner(null, null, options);
    }

    if (typeof parent === 'function') {
      return new Runner(options, null, parent);
    }

    if (!(this instanceof Runner)) {
      return new Runner(options, parent, fn);
    }

    Base.call(this);
    this.use(runtimes());

    if (typeof config.initFn === 'function') {
      config.initFn.call(this, this);
    }

    if (!this.name) {
      this.name = this.options.name || 'base';
    }

    this.options = options || {};
    this.define('parent', null);
    this[plural] = {};
    this.config = {};
    this.paths = {};
    this.env = {};

    if (parent) {
      this.parent = parent;
    } else {
      this.initRunner();
    }

    if (typeof fn === 'function') {
      this.invoke(fn);
    }
  }

  /**
   * Inherit Base
   */

  Base.extend(Runner);

  /**
   * Create a the "App" constructor for Runner to use.
   */

  var App = child(Runner, config);

  /**
   * Create the `base` runner instance, along with any defaults,.
   */

  Runner.prototype.initRunner = function() {
    this.use(env());
    this.loadMiddleware({});
    this.loadTasks({});
  };

  /**
   * Load an object of middleware functions.
   */

  Runner.prototype.loadMiddleware = function(fns) {
    for (var fn in fns) this.invoke(fns[fn]);
  };

  /**
   * Load an object of tasks.
   */

  Runner.prototype.loadTasks = function(tasks) {
    for (var key in tasks) {
      this.task(key, this.invoke(tasks[key]));
    }
  };

  /**
   * Call the given `fn` in the context if the current instance,
   * passing the instance, the `base` instance, and `env` as
   * arguments to `fn`.
   *
   * @param {Function} `fn`
   * @return {Object} Returns the instance, for chaining.
   */

  Runner.prototype.invoke = function(fn) {
    fn.call(this, this, this.base, this.env);
    return this;
  };

  /**
   * Add a leaf to the task-runner tree.
   *
   * @param {String} `name`
   * @param {Array} `tasks`
   */

  Runner.prototype.leaf = function(name, tasks) {
    this.tree = this.tree || {};
    this.tree[name] = Object.keys(tasks);
  };

  /**
   * Proxy to the `register` method for getting or setting
   * an `app` on the instance (for example, generators and
   * updaters are apps).
   *
   * @param {String} `name`
   * @param {Object} `options`
   * @param {Function} `fn`
   * @return {Object} Returns an app.
   */

  Runner.prototype[method] = function(name, options, fn) {
    if (arguments.length === 1 && typeof name === 'string') {
      return this.getApp.apply(this, arguments);
    }
    return this.register.apply(this, arguments);
  };

  Runner.prototype.getApp = function(name) {
    if (name === 'base') return this;
    name = name.split('.').join('.' + plural + '.');
    var res = utils.get(this[plural], name);
    // if (typeof res === 'undefined') {
    //   throw new Error('Runner cannot resolve ' + name);
    // }
    return res;
  };

  /**
   * Get or set na `app` on the instance. Generators and updaters
   * are examples of "apps".
   *
   * @param {String} `name`
   * @param {Object} `options`
   * @param {Function} `fn`
   * @return {Object} Returns an app.
   */

  Runner.prototype.register = function(name, options, fn) {
    if (typeof options === 'function') {
      return this.register(name, {}, options);
    }

    var app = new App(name, options, this, fn);
    var alias = app.alias;
    var tasks = app.tasks;

    if (typeof app.use === 'function') {
      this.run(app);
    }

    this.emit('register', alias, app);
    this.leaf(alias, tasks);

    this[plural][alias] = app;
    return app;
  };

  /**
   * Resolve apps from one or more glob patterns, file paths,
   * or explicitly defined name with an "app" function.
   *
   * @param {String} `name`
   * @param {Object} `options`
   * @param {Function} `fn`
   * @return {Object} Returns an app.
   */

  Runner.prototype.resolve = function(name, options, fn) {
    if (utils.hasGlob(name)) {
      utils.resolve(name, options).forEach(function(fp) {
        try {
          this.register(fp, options, require(fp));
        } catch (err) {
          this.emit('error', err);
        }
      }.bind(this));
      return this;
    }
    if (!fn && utils.isObject(options) && options.isGenerate) {
      this.register(name, options);
      return this;
    }
    return this.register.apply(this, arguments);
  };

  /**
   * Run the given applications and their `tasks`. The given
   * `callback` function will be called when the tasks are complete.
   *
   * ```js
   * generators: {
   *   foo: ['one', 'two'], // tasks
   *   bar: ['three']
   * }
   * ```
   * @param {String|Array|Object} `tasks`
   * @param {Function} cb
   * @return {Object} returns the instance for chaining
   */

  Runner.prototype.runTasks = function(tasks, cb) {
    if (!utils.isObject(tasks)) {
      tasks = toTasks(tasks, this, plural);
    }

    if (Array.isArray(tasks)) {
      utils.async.each(tasks, function(task, next) {
        this.build(task, next);
      }.bind(this), cb);
      return this;
    }

    utils.async.eachOf(tasks, function(list, name, next) {
      var app = this[method](name);
      this.emit('runTasks', name, app);
      app.build(list, next);
    }.bind(this), cb);
    return this;
  };

  Runner.prototype.build = function(tasks, cb) {
    if (typeof tasks === 'string') {
      return this.runTasks.apply(this, arguments);
    }
    if (utils.isObject(tasks)) {
      return this.runTasks.apply(this, arguments);
    }
    if (Array.isArray(tasks)) {
      if (utils.isSimpleTask(tasks)) {
        proto.build.call(this, tasks, cb);
        return this;
      }
      utils.async.each(tasks, function(task, next) {
        this.build(task, next);
      }.bind(this), cb);
      return this;
    }
    this.emit('build', tasks);
    proto.build.call(this, tasks, cb);
  };

  /**
   * Custom `inspect` method.
   */

  // Runner.prototype.inspect = function() {
  //   var obj = {
  //     name: this.name,
  //     path: this.path,
  //     env: this.env,
  //     options: this.options,
  //   };

  //   if (typeof config.inspectFn === 'function') {
  //     config.inspectFn.call(this, obj, this);
  //   }

  //   obj.tasks = Object.keys(this.tasks);
  //   if (this.tree) {
  //     obj.tree = this.tree;
  //   }
  //   return obj;

  //   // var tasks = Object.keys(this.tasks).join(', ') || 'none';
  //   // return '<App "' + this.name + '" <tasks: ' + tasks + '>>';
  // };

  /**
   * Get the depth of the current instance. This provides a quick
   * insight into how many levels of nesting there are between
   * the `base` instance and the current application.
   *
   * ```js
   * console.log(this.depth);
   * //= 1
   * ```
   * @return {Number}
   */

  utils.define(Runner.prototype, 'depth', {
    get: function() {
      return this.parent ? this.parent.depth + 1 : 0;
    }
  });

  /**
   * Get the `base` instance.
   *
   * ```js
   * var base = this.base;
   * ```
   * @return {Object}
   */

  utils.define(Runner.prototype, 'base', {
    get: function() {
      return this.parent ? this.parent.base : this;
    }
  });

  /**
   * Get the `path` for the instance.
   */

  utils.define(Runner.prototype, 'path', {
    set: function(fp) {
      this.cache.path = fp;
    },
    get: function() {
      var fp = this.cache.path || this.options.path || 'none';
      return (this.cache.path = fp);
    }
  });

  /**
   * Get the `cwd` (current working directory) for the application instance.
   */

  utils.define(Runner.prototype, 'cwd', {
    set: function(dir) {
      this.cache.cwd = dir;
    },
    get: function() {
      return this.cache.cwd || (this.cache.cwd = process.cwd());
    }
  });

  return Runner;
};

/**
 * Expose `create`
 */

module.exports = create;
