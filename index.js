/*!
 * base-runner <https://github.com/jonschlinkert/base-runner>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var utils = require('./utils');

/**
 * Create a customized `Runner` constructor with the given `config`.
 *
 * ```js
 * var runner = require('base-runner');
 * var Generate = require('generate');
 *
 * // register `runner` as a mixin
 * Generate.mixin(runner('generate', 'generator'));
 *
 * // get the `base` instance
 * var base = Generate.getConfig('generator.js')
 *   .resolve('generator.js', {
 *     cwd: __dirname
 *   });
 * ```
 *
 * @param {String} `moduleName` The name of the "parent" module, ex: `generate`
 * @param {String} `appName` The name of the "child" apps, ex: `generator`
 * @return {Function}
 */

function runner(moduleName, appName) {
  var toSingle = utils.inflection.singularize;
  var toPlural = utils.inflection.pluralize;

  appName = toSingle(appName);

  // create property and method names
  var parent = utils.pascal(appName);
  var plural = toPlural(appName);
  var isName = 'is' + utils.pascal(moduleName);
  var method = function(prop) {
    return prop + parent;
  };

  return function plugin(proto) {
    var Ctor = proto.constructor;

    /**
     * Static method for getting the very first instance to be used
     * as the `base` instance. The first instance will either be defined
     * by the user, like in local `node_modules`, or a globally installed
     * module that serves as a default/fallback.
     *
     * ```js
     * var base = Base.getConfig('generator.js');
     * ```
     * @name .getConfig
     * @param {String} `filename` Then name of the config file to lookup.
     * @return {Object} Returns the "base" instance.
     * @api public
     */

    Ctor.getConfig = function(filename, fallback) {
      var base = utils.resolver.getConfig(filename, moduleName, {
        Ctor: Ctor,
        fallback: fallback,
        isModule: function(app) {
          return app[isName];
        }
      });
      base.initRunner(base);
      return base;
    };

    /**
     * Private method for initializing runner defaults and listening for config
     * objects to be emitted.
     *
     * @return {Object}
     */

    proto.initRunner = function(base) {
      var name = this.name = this.options.name || 'base';
      this.env = {};

      this[isName] = true;
      this[plural] = this[plural] || {};

      this
        .use(utils.cli())
        .use(utils.argv({prop: plural}))
        .use(utils.resolver(moduleName))
        .use(utils.runtimes({
          displayName: function(key) {
            return name + ':' + key;
          }
        }));

      // get the argv processing fns from the instance
      // (both do very different things)
      var processFn = this.cli.process;
      var argvFn = this.processArgv;

      this.cli.process = function(argv) {
        var args = argvFn.call(base, argv);
        processFn.call(base.cli, args);
        base.set('env.argv', args);
        return args;
      };

      this.on('config', function(env, mod) {
        if (env.alias === moduleName) env.alias = 'base';
        mod.path = mod.path || this.path;
        this.register(env.alias, env.fn, this, env);
      }.bind(this));
      return this;
    };

    /**
     * Get task `name` from the `runner.tasks` object.
     *
     * ```js
     * runner.getTask('abc');
     *
     * // get a task from app `foo`
     * runner.getTask('foo:abc');
     *
     * // get a task from sub-app `foo.bar`
     * runner.getTask('foo.bar:abc');
     * ```
     * @name .getTask
     * @param {String} `name`
     * @return {Object}
     * @api public
     */

    proto.getTask = function(name) {
      var segments = name.split(':');
      if (segments.length === 1) {
        return this.tasks[name];
      }
      var app = this[method('get')](segments[0]);
      return app.getTask(segments[1]);
    };

    /**
     * Register `app` with the given `name`.
     *
     * ```js
     * runner.register('foo', function(app, base, env) {
     *   app.task('foo-a', function() {});
     *   app.task('foo-b', function() {});
     *   app.task('foo-c', function() {});
     *
     *   // sub-app
     *   app.register('bar', function(sub) {
     *     sub.task('bar-a', function() {});
     *     sub.task('bar-b', function() {});
     *     sub.task('bar-c', function() {});
     *   });
     * });
     *  ```
     * @name .register
     * @param {String} `name` The app's name.
     * @param {Object|Function} `app` Generator can be an instance of runner or a function. Generator functions are invoked with a new instance of `Runner`, a `base` instance that is used for storing all apps, and `env`, an object with user environment details, such as `cwd`.
     * @return {String}
     */

    proto.register = function(name, app, base, env) {
      if (typeof app === 'function') {
        app = this.invoke(app);
      }

      app.define('parent', this);
      app.name = name;
      app.env = env;

      this.emit('register', name, app);
      this[plural][name] = app;
      return this;
    };

    /**
     * Alias for `register`. Adds an `app` with the given `name`
     * to the `runner.apps` object.
     *
     * @name .addApp
     * @param {String} `name` The name of the config object to register
     * @param {Object|Function} `config` The config object or function
     * @api public
     */

    proto[method('add')] = function(name, config) {
      return this.register.apply(this, arguments);
    };

    /**
     * Return true if app `name` is registered. Dot-notation
     * may be used to check for [sub-apps](#sub-apps).
     *
     * ```js
     * base.hasApp('foo.bar.baz');
     * ```
     * @name .hasApp
     * @param {String} `name`
     * @return {Boolean}
     * @api public
     */

    proto[method('has')] = function(name) {
      if (this[plural].hasOwnProperty(name)) {
        return true;
      }
      name = name.split('.').join('.' + plural + '.');
      return this.has([plural, name]);
    };

    /**
     * Return app `name` is registered. Dot-notation
     * may be used to get [sub-apps](#sub-apps).
     *
     * ```js
     * base.getApp('foo');
     * // or
     * base.getApp('foo.bar.baz');
     * ```
     * @name .getApp
     * @param {String} `name`
     * @return {Boolean}
     * @api public
     */

    proto[method('get')] = function(name) {
      if (name === 'base') return this;
      if (this[plural].hasOwnProperty(name)) {
        return this[plural][name];
      }
      name = name.split('.').join('.' + plural + '.');
      return this.get([plural, name]);
    };

    /**
     * Extend an app.
     *
     * ```js
     * var foo = base.getApp('foo');
     * foo.extendApp(app);
     * ```
     * @name .extendApp
     * @param {Object} `app`
     * @return {Object} Returns the instance for chaining.
     * @api public
     */

    proto[method('extend')] = function(app) {
      if (typeof this.fn !== 'function') {
        throw new Error('base-runner expected `fn` to be a function');
      }
      this.fn.call(app, app, this.base, app.env || this.env);
      return this;
    };

    /**
     * Run one or more generators and the specified tasks for each.
     *
     * ```js
     * // run the default tasks for generators `foo` and `bar`
     * generate.runGenerators(['foo', 'bar'], function(err) {
     *   if (err) return console.log(err);
     *   console.log('done!');
     * });
     *
     * // run the specified tasks for generators `foo` and `bar`
     * var generators = {
     *   foo: ['a', 'b', 'c'],
     *   bar: ['x', 'y', 'z']
     * };
     *
     * generate.runGenerators(generators, function(err) {
     *   if (err) return console.log(err);
     *   console.log('done!');
     * });
     * ```
     * @param {Object} `generators`
     * @param {Function} `done`
     * @api public
     */

    proto[toPlural(method('run'))] = function(apps, done) {
      if (!Array.isArray(apps) || !utils.isObject(apps[0])) {
        apps = this.argv(apps)[plural];
      }
      utils.async.each(apps, function(app, cb) {
        utils.async.eachOf(app, function(tasks, name, next) {
          var instance = this[plural][name] || this;
          if (!instance) {
            return cb(new Error('cannot find ' + appName + ' "' + name + '"'));
          }
          return instance.build(tasks, cb);
        }.bind(this), cb);
      }.bind(this), done);
    };

    /**
     * Invoke app `fn` with the given `base` instance.
     *
     * ```js
     * runner.invoke(app.fn, app);
     * ```
     * @name .invoke
     * @param {Function} `fn` The app function.
     * @param {Object} `app` The "base" instance to use with the app.
     * @return {Object}
     * @api public
     */

    proto.invoke = function(fn) {
      var app = new this.constructor();
      app.fn = fn;
      fn.call(app, app, this.base, this.env);
      return app;
    };

    /**
     * Get the `base` instance
     */

    Object.defineProperty(proto, 'base', {
      get: function() {
        return this.parent ? this.parent.base : this;
      }
    });

  };
}

/**
 * Expose `runner`
 */

module.exports = runner;
