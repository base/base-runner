/*!
 * base-runner <https://github.com/jonschlinkert/base-runner>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var fs = require('fs');
var path = require('path');
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
  if (typeof moduleName !== 'string') {
    throw new TypeError('expected "moduleName" to be a string');
  }
  if (typeof appName !== 'string') {
    throw new TypeError('expected "appName" to be a string');
  }

  var toSingular = utils.inflection.singularize;
  var toPlural = utils.inflection.pluralize;

  appName = toSingular(appName);

  // create property and method names
  var parent = utils.pascal(appName);
  var plural = toPlural(appName);
  var isName = 'is' + utils.pascal(moduleName);
  var method = function(prop) {
    return prop + parent;
  };

  return function plugin(proto) {
    var Ctor = proto.constructor;
    if (proto instanceof Ctor) {
      throw new Error('base-runner must be used as a mixin, not as an instance plugin.');
    }

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
      var base = getConfig(filename, moduleName, {
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

    proto.initRunner = function() {
      var name = this.name = this.options.name || 'base';
      this.env = this.env || {};

      this[plural] = this[plural] || {};
      this[isName] = true;

      this
        .use(utils.cli())
        .use(utils.argv({prop: plural}))
        .use(utils.resolver(moduleName))
        .use(utils.runtimes({
          displayName: function(key) {
            return name + ':' + key;
          }
        }));

      initListeners(this);
      proxyArgv(this);
      return this;
    };

    /**
     * Ensure argv is parsed for the `base-cli` and
     * `base-argv` plugins at the same time.
     */

    function proxyArgv(app) {
      var processFn = app.cli.process;
      var argvFn = app.processArgv;

      app.cli.process = function(argv) {
        var args = argvFn.call(app, argv);
        processFn.call(app.cli, args);
        app.set('env.argv', args);
        return args;
      };
    }

    /**
     * Add a `config` listener to `app`, and register
     * a `fn` each time a config is emitted
     */

    function initListeners(app) {
      app.on('config', function(name, env) {
        env.module.path = env.module.path || app.path;
        var config = env.config;
        var alias = config.alias;
        var fn = config.fn;

        if (alias === moduleName) {
          alias = 'base';
        }
        app.register(alias, fn, app, env);
      });
    }

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
      if (typeof this[plural] === 'undefined') {
        var ctor = this.constructor.name;
        throw new Error('object "' + plural + '" is not defined on ' + ctor);
      }
      if (typeof app === 'undefined') {
        throw new Error('expected ' + appName + ' to be a function or object');
      }

      app = this.invoke(name, app, base, env);
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
     * Run one or more apps and the specified tasks for each.
     *
     * ```js
     * // run the default tasks for apps `foo` and `bar`
     * foo.runApps(['foo', 'bar'], function(err) {
     *   if (err) return console.log(err);
     *   console.log('done!');
     * });
     *
     * // run the specified tasks for apps `foo` and `bar`
     * var apps = {
     *   foo: ['a', 'b', 'c'],
     *   bar: ['x', 'y', 'z']
     * };
     *
     * foo.runApps(apps, function(err) {
     *   if (err) return console.log(err);
     *   console.log('done!');
     * });
     * ```
     * @param {Object} `apps`
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

    proto.invoke = function(name, app, base, env) {
      if (typeof app === 'function') {
        var fn = app;
        app = new this.constructor();
        app.name = name;
        app.env = env || this.env;
        app.fn = fn;
        fn.call(app, app, base || app.base, app.env);
      } else {
        // `parent` is used to get the base instance
        app.name = name;
        app.env = env || app.env || this.env;
      }

      app.define('parent', this);
      return app;
    };

    /**
     * Get the `base` instance
     */

    Object.defineProperty(proto, 'base', {
      configurable: true,
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

/**
 * If necessary, this static method will resolve the _first instance_
 * to be used as the `base` instance for caching any additional resolved configs.
 *
 * ```js
 * var Generate = require('generate');
 * var resolver = require('base-resolver');
 *
 * var generate = resolver.first('generator.js', 'generate', {
 *   Ctor: Generate,
 *   isModule: function(app) {
 *     return app.isGenerate;
 *   }
 * });
 * ```
 * @param {String} `configfile` The name of the config file, ex: `assemblefile.js`
 * @param {String} `moduleName` The name of the module to lookup, ex: `assemble`
 * @param {Object} `options`
 *   @option {Function} `options.isModule` Optionally pass a function that will be used to verify that the correct instance was created.
 * @return {Object}
 * @api public
 */

function getConfig(configfile, moduleName, options) {
  var opts = utils.extend({ cwd: process.cwd() }, options);
  var fp = path.resolve(opts.cwd, configfile);

  var createEnv = utils.resolver.Resolver.createEnv;
  var fallback = opts.fallback;
  var Ctor = opts.Ctor;

  if (!utils.isAbsolute(fallback)) {
    fallback = utils.resolveModule(opts.fallback);
  }

  if (typeof Ctor !== 'function') {
    throw new TypeError('expected options.Ctor to be a function');
  }

  var validate = function() {
    return false;
  };

  if (typeof opts.isModule === 'function') {
    validate = opts.isModule;
  }

  // if a "configfile.js" is in the user's cwd, we'll try to
  // require it in and use it to get (or create) the instance
  if (fs.existsSync(fp)) {
    opts.module = moduleName;
    var env = createEnv(fp, opts.cwd, opts);
    Ctor = env.module.fn;

    // `fn` is whatever the "configfile" returns
    var fn = env.config.fn;

    // if the "configfile" returns a function, we need to
    // call the function, and pass an instance of our
    // application to it
    if (typeof fn === 'function') {
      var app = new Ctor();
      return app.invoke('base', fn, app, env);
    }

    // Otherwise, if the "configfile" returns an instance
    // of our application we'll use that as our `base`
    if (validate(fn)) {
      return fn;
    }
  }

  // if we haven't resolved a user-specified config file by now,
  // try the fallback dir, if passed on the options
  if (fallback && fallback !== opts.cwd) {
    opts.cwd = fallback;
    var base = getConfig(configfile, moduleName, opts);
    return base;
  }

  // create a new, bare instance as a last resort
  return new Ctor();
};

/**
 * Expose `getConfig`
 */

module.exports.getConfig = getConfig;
