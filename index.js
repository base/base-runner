'use strict';

var toTasks = require('./lib/to-tasks');
var utils = require('./lib/utils');
var env = require('./lib/env');

/**
 * Create a Runner application using the given `Base` constructor
 * and `config`.
 *
 * ```js
 * var create = require('base-runner');
 * var Runner = create(Generate, {
 *   parent: 'Generate',
 *   child: 'Generator',
 *   appname: 'generate',
 *   method: 'generator',
 *   plural: 'generators',
 *   configfile: 'generate.js',
 *   initFn: function () {
 *     this.isGenerate = true;
 *     this.isGenerator = false;
 *   },
 *   inspectFn: function (obj) {
 *     obj.isGenerate = this.isGenerate;
 *     obj.isGenerator = this.isGenerator;
 *     obj.generators = this.generators;
 *   },
 * });
 * ```
 * @param {Function} `Base` constructor function
 * @param {Object} `config`
 * @return {Function}
 * @api public
 */

function create(Base, config) {
  if (utils.isObject(Base)) {
    config = Base;
    Base = require('base-methods');
  }

  // initialize configuration defaults
  config = utils.createConfig(config || {});

  // get the primary names to use
  var method = config.method || 'app';
  var plural = config.plural || 'apps';

  // store a reference to the `Base` prototype
  var proto = Base.prototype;

  /**
   * Create an instance of Runner with the given `options`,
   * and optionally a `parent` instance and `fn` to be invoked
   * (for example, `fn` would be an updater or generator).
   *
   * ```js
   * var create = require('base-runner');
   * var Runner = create(Generate, {...});
   * var app = new Runner();
   * ```
   * @param {Object} `options`
   * @param {Object} `parent`
   * @param {Function} `fn`
   * @api public
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
    this.use(utils.runtimes());

    if (typeof config.initFn === 'function') {
      config.initFn.call(this, this);
    }

    if (!this.name) {
      this.name = Base.name || 'base';
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
    var App = this.Ctor;
    var app = this;
    if (App && App.prototype.register) {
      app = new App();
    }
    fn.call(this, app, this.base, this.env);
    return this;
  };

  /**
   * Run task(s) or applications and their task(s), calling the `callback`
   * function when the tasks are complete.
   *
   * ```js
   * // run tasks
   * app.task('foo', function() {});
   * app.build(['foo'], function(err) {
   *   // foo is complete!
   * });
   *
   * // run generators and their tasks
   * app.register('one', function(one) {
   *   one.task('foo', function() {});
   *   one.task('bar', function() {});
   * });
   * app.build('one', function(err) {
   *   // one is complete!
   * });
   *
   * // run a specific generator-task
   * app.register('one', function(one) {
   *   one.task('foo', function() {});
   *   one.task('bar', function() {});
   * });
   * app.build('one:bar', function(err) {
   *   // one:bar is complete!
   * });
   * ```
   * @param {String|Array|Object} `tasks`
   * @param {Function} `cb`
   * @return {Object} returns the instance for chaining
   * @api public
   */

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
   * Proxy to `build`. Runs the given applications and their
   * `tasks` with a `callback` function to be called when the
   * tasks are complete.
   *
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
   * Custom `inspect` method.
   */

  Runner.prototype.inspect = function() {
    var obj = {
      options: this.options,
      parent: Base.name,
      name: this.name,
      path: this.path,
      env: this.env
    };

    obj.tasks = Object.keys(this.tasks);
    if (this.tree) {
      obj.tree = this.tree;
    }

    if (typeof config.inspectFn === 'function') {
      config.inspectFn.call(this, obj, this);
    }
    return obj;
  };

  /**
   * Get the depth of the current instance. This provides a quick
   * insight into how many levels of nesting there are between
   * the `base` instance and the current application.
   *
   * ```js
   * console.log(this.depth);
   * //= 1
   * ```
   * @name .depth
   * @param {getter} Getter only
   * @return {Number}
   * @api public
   */

  utils.define(Runner.prototype, 'depth', {
    get: function() {
      return this.parent ? this.parent.depth + 1 : 0;
    }
  });

  /**
   * Gets the `base` instance, which is the first instance created.
   *
   * ```js
   * var base = this.base;
   * ```
   * @name .base
   * @param {getter} Getter only
   * @return {Object} The `base` instance
   * @api public
   */

  utils.define(Runner.prototype, 'base', {
    get: function() {
      return this.parent ? this.parent.base : this;
    }
  });

  return Runner;
};

/**
 * Expose `create`
 */

module.exports = create;
