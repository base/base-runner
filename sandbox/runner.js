'use strict';

var path = require('path');
var red = require('ansi-red');
var assert = require('assert');
var runtimes = require('composer-runtimes');
var toTasks = require('../lib/to-tasks');
var utils = require('../lib/utils');
var env = require('../lib/env');

function runner(Base, Child, config) {
  config = config || {};
  var proto = Base.prototype;

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
    this.define('parent', null);
    this.use(runtimes());

    this.validate();

    if (!this.name) {
      this.name = this.options.name || 'root';
    }

    this.options = options || {};
    this.define('cache', this.cache);
    this.generators = {};
    this.env = {};

    if (parent) {
      this.parent = parent;
    } else {
      this.initEnv();
    }

    if (typeof fn === 'function') {
      this.invoke(fn);
    }
  }

  /**
   * Inherit Base
   */

  Base.extend(Runner);

  Runner.prototype.validate = function() {
    // assert(!'set' in this, red('app should not have `set`'));
  };

  /**
   * Create the `base` generate instance, along with any defaults,.
   */

  Runner.prototype.initEnv = function() {
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

  Runner.prototype.leaf = function(name, tasks) {
    this.tree = this.tree || {};
    this.tree[name] = Object.keys(tasks);
  };

  Runner.prototype.generator = function(name, options, fn) {
    if (arguments.length === 1 && typeof name === 'string') {
      if (name === 'base') return this;
      name = name.split('.').join('.generators.');
      return utils.get(this.generators, name);
    }
    return this.register.apply(this, arguments);
  };

  Runner.prototype.register = function(name, options, fn) {
    if (typeof options === 'function') {
      fn = options;
      options = {};
    }
    var generator = new Child(name, options, this, fn);
    var alias = generator.alias;
    var tasks = generator.tasks;

    this.emit('register', alias, generator);
    this.leaf(alias, tasks);

    this.generators[alias] = generator;
    return generator;
  };

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

  Runner.prototype.runTasks = function(tasks, cb) {
    if (typeof tasks === 'string') {
      tasks = toTasks(tasks);
    }

    if (Array.isArray(tasks)) {
      utils.async.each(tasks, function(task, next) {
        this.build(task, next);
      }.bind(this), cb);
      return this;
    }

    utils.async.eachOf(tasks, function(list, name, next) {
      var generator = this.generator(name);
      this.emit('runTasks', name, generator);
      generator.build(list, next);
    }.bind(this), cb);
    return this;
  };

  function isSimpleTask(tasks) {
    tasks = utils.arrayify(tasks);
    var len = tasks.length;
    while(len--) {
      if (typeof tasks[len] !== 'string' || /\W/.test(tasks[len])) {
        return false;
      }
    }
    return true;
  }


  Runner.prototype.build = function(tasks, cb) {
    if (typeof tasks === 'string' && /\W/.test(tasks)) {
      return this.runTasks.apply(this, arguments);
    }
    if (utils.isObject(tasks)) {
      return this.runTasks.apply(this, arguments);
    }
    if (Array.isArray(tasks)) {
      if (isSimpleTask(tasks)) {
        proto.build.call(this, tasks, cb);
        return this;
      }
      utils.async.each(tasks, function(task, next) {
        this.build(task, next);
      }.bind(this), cb);
      return this;
    }
    proto.build.call(this, tasks, cb);
  };

  /**
   * Custom `inspect` method.
   */

  Runner.prototype.inspect = function() {
    var obj = {
      isGenerate: this.isGenerate,
      isGenerator: this.isGenerator,
      name: this.name,
      path: this.path,
      env: this.env,
      options: this.options,
      generators: this.generators,
      tasks: Object.keys(this.tasks)
    };

    if (this.tree) {
      obj.tree = this.tree;
    }
    return obj;

    // var tasks = Object.keys(this.tasks).join(', ') || 'none';
    // return '<Generator "' + this.name + '" <tasks: ' + tasks + '>>';
  };

  utils.define(Runner.prototype, 'depth', {
    get: function() {
      return this.parent ? this.parent.depth + 1 : 0;
    }
  });

  utils.define(Runner.prototype, 'base', {
    get: function() {
      return this.parent ? this.parent.base : this;
    }
  });

  /**
   * Get the `path` for the generator.
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
   * Get the `cwd` (current working directory) for the generator.
   */

  utils.define(Runner.prototype, 'cwd', {
    set: function(dir) {
      this.cache.cwd = dir;
    },
    get: function() {
      return this.cache.cwd || (this.cache.cwd = process.cwd());
    }
  });

  /**
   * Get the `dirname` for the generator.
   */

  utils.define(Runner.prototype, 'dirname', {
    set: function(dir) {
      this.path = path.join(dir, path.basename(this.path));
    },
    get: function() {
      return path.dirname(this.path);
    }
  });

  /**
   * Get the `basename` for the generator.
   */

  utils.define(Runner.prototype, 'basename', {
    set: function(basename) {
      this.path = path.join(path.dirname(this.path), basename);
    },
    get: function() {
      return path.basename(this.path);
    }
  });

  /**
   * Get the `filename` for the generator.
   */

  utils.define(Runner.prototype, 'filename', {
    set: function(filename) {
      this.path = path.join(path.dirname(this.path), filename + this.extname);
    },
    get: function() {
      return path.basename(this.path, this.extname);
    }
  });


  return Runner;
};

/**
 * Expose `runner`
 */

module.exports = runner;
