/*!
 * base-runner <https://github.com/jonschlinkert/base-runner>
 *
 * Copyright (c) 2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var path = require('path');
var debug = require('debug')('base:runner');
var settings = require('./lib/settings');
var plugins = require('./lib/plugins');
var config = require('./lib/config');
var utils = require('./lib/utils');

module.exports = function(config) {
  return function(app) {
    if (this.isRegistered('base-runner')) return;

    if (!this.isRegistered('base-generators', false)) {
      throw new Error('expected the base-generators plugin to be registered');
    }

    debug('initializing runner for "' + this._name + '"');

    /**
     * Initialize runner plugins
     */

    initPlugins(this);

    /**
     * Setup a CLI for running a base application.
     *
     * ```js
     * base.runner('verbfile.js', function(err, argv, app) {
     *   // handle err
     *   // do stuff with argv and app
     *
     *   app.cli.process(argv, function(err) {
     *     // handle err
     *   });
     * });
     * ```
     * @param {String} `configfile` The name of the configfile to initialize with. For example, `generator.js`, `assemblefile.js`, `verbfile.js` etc.
     * @param {Function} `callback` Callback that exposes `err`, `argv` and `app` as arguments. `argv` is pre-processed by [minimist] then processed by [expand-args]. The original `argv` array is exposed on `argv.orig`, and the object returned by minimist is exposed on `argv.minimist`. `app` is the resolved application instance to be used.
     * @return {undefined}
     * @api public
     */

    this.define('runner', function runner(configfile, argv, cb) {
      debug('runner args: "%j"', arguments);

      if (typeof argv === 'function') {
        cb = argv;
        argv = process.argv.slice(2);
      }

      if (typeof cb !== 'function') {
        throw new TypeError('expected a callback function');
      }

      if (typeof configfile !== 'string') {
        cb(new TypeError('expected configfile to be a string'));
        return;
      }

      // set the configfile to use
      this.options.configfile = configfile;
      this.configfile = configfile;

      try {
        var configOpts = utils.extend({}, config, this.options);

        // process argv
        var args = createArgs(app, configOpts, argv);

        // merge processed argv with configuration settings from environment
        var opts = createOpts(app, configOpts, args);

        // listen for events
        listen(this, opts);

        // if a configfile exists in the user's cwd, load it now
        var file = resolveConfig(configfile, opts);
        if (file) {
          // show configfile path
          this.configpath = file;
          if (opts.tasks !== null) {
            var fp = utils.green('~/' + utils.homeRelative(file));
            utils.timestamp('using ' + this.configname + ' ' + fp);
          }

          // register the configfile as the "default" generator
          this.registerConfig('default', file, opts);
          this.hasConfigfile = true;
        } else {
          setDefaults(this, opts);
        }
      } catch (err) {
        err.message = 'base-runner#runner ' + err.message;
        cb.call(this, err);
        return;
      }

      // update options
      this.options = utils.extend({}, this.options, opts);

      // sort args to pass to base-cli
      var sortedArgs = this.sortArgs(opts, {
        keys: this.cli.keys,
        last: ['ask', 'tasks'],
        first: ['emit', 'save']
      });

      // set sorted args on `cache.config`
      app.base.set('cache.config', sortedArgs);

      cb.call(this, null, sortedArgs, this);
    });

    /**
     * Sort arguments so that `app.cli.process` executes commands
     * in the order specified.
     *
     * @param {Object} `app` Application instance
     * @param {Object} `argv` The expanded argv object
     * @param {Object} `options`
     * @param {Array} `options.first` The keys to run first.
     * @param {Array} `options.last` The keys to run last.
     * @return {Object} Returns the `argv` object with sorted keys.
     */

    this.define('sortArgs', function(argv, options) {
      var opts = utils.extend({keys: []}, options);
      var keys = opts.keys || [];
      var first = opts.first || [];
      var last = opts.last || [];

      keys = utils.union(first, keys, Object.keys(argv));
      keys = utils.diff(keys, last);
      keys = utils.union(keys, last);

      var len = keys.length;
      var idx = -1;
      var res = {};

      while (++idx < len) {
        var key = keys[idx];
        if (argv.hasOwnProperty(key)) {
          res[key] = argv[key];
        }
      }
      return res;
    });
  };
};

/**
 * Create options to initialize with. This object is created by
 * the `base-settings` plugin.
 *
 * @param {Object} `app`
 * @param {Object} `args` processed argv object
 * @return {Object}
 */

function createOpts(app, configOpts, args) {
  var tasks = args.tasks;
  var keys = Object.keys(args);
  var len = keys.length;
  if (tasks) len--;

  // temporarily delete tasks from args
  if (utils.isDefaultTask(args)) {
    delete args.tasks;
  }

  // load the user's configuration settings
  args = utils.omitEmpty(args);
  var config = app.loadSettings(args);
  var opts = utils.omitEmpty(config.merge());
  opts = utils.extend({}, configOpts, opts);

  opts.cwd = opts.cwd || app.cwd;
  opts.tasks = args.tasks || opts.tasks || tasks;

  if (len >= 1 && !opts.run && !utils.isWhitelisted(args)) {
    opts.tasks = null;
  }

  args.tasks = opts.tasks;
  app.isDefaultTask = utils.isDefaultTask(args);
  return opts;
}

/**
 * Returns the resolved absolute filepath to `configfile`, if one exists,
 * in the user's working directory. Otherwise returns `undefined`.
 *
 * @param {String} `configfile`
 * @param {String} `opts`
 * @return {String|undefined}
 */

function resolveConfig(configfile, opts) {
  var cwd = typeof opts.cwd === 'string' ? opts.cwd : process.cwd();
  var configpath = path.resolve(cwd, opts.file || opts.configfile || configfile);
  if (utils.exists(configpath)) {
    return configpath;
  }
}

/**
 * When only the `default` task is defined, this checks to see if
 * the user has stored task preferences, and if so, uses those instead
 * of `default`.
 *
 * @param {Object} `app`
 * @param {Object} `opts`
 */

function setDefaults(app, opts, pkg) {
  if (utils.isDefaultTask(opts)) {
    var tasks = app.store.get('tasks');

    if (typeof tasks === 'string') {
      opts.tasks = tasks.split(' ');

    } else if (tasks) {
      opts.tasks = utils.arrayify(tasks);
    }
  }
}

/**
 * Move certain properties onto `config` so they're only processed
 * by the config schema.
 *
 * @param {Object} `argv`
 * @return {Object}
 */

function preprocess(argv) {
  var keys = ['layout', 'toc', 'reflinks', 'related', 'plugins', 'helpers'];
  var len = keys.length;
  while (len--) {
    var key = keys[len];
    if (argv.hasOwnProperty(key)) {
      utils.set(argv, ['config', key], argv[key]);
      delete argv[key];
    }
  }
}

/**
 * Create the `argv` object to use for application settings.
 *
 * @param {Object} `app`
 * @param {Object} `options`
 * @param {Object} `argv`
 * @return {Object}
 */

function createArgs(app, configOpts, argv) {
  var alias = {
    filename: 'stem',
    dirname: 'dir',
    extname: 'ext',
    version: 'V',
    verbose: 'v',
    global: 'g',
    config: 'c',
    save: 's',
    file: 'f'
  };

  if (Array.isArray(argv)) {
    argv = utils.minimist(argv, {alias: alias});
  }

  return app.argv(argv, utils.extend({
    whitelist: utils.whitelist,
    first: ['emit', 'save', 'config', 'file'],
    last: ['ask', 'tasks'],
    esc: utils.fileKeys
  }, configOpts));
}

/**
 * Initialize runner plugins
 *
 * @param {Object} `app` base app instance
 */

function initPlugins(app) {
  app.use(plugins.logger());
  app.use(plugins.cwd());
  app.use(settings());

  if (!app.isRegistered('base-option', false)) {
    app.use(plugins.option());
  }

  // Register plugins to be lazily invoked
  app.lazy('project', plugins.project);
  app.lazy('pkg', plugins.pkg);
  app.lazy('cli', plugins.cli);
  app.lazy('config', config);
  app.lazy('argv', plugins.argv);

  app.lazy('store', function() {
    return function() {
      this.use(plugins.store(this._name));

      // create a local "sub-store" for the cwd
      Object.defineProperty(this.store, 'local', {
        configurable: true,
        enumerable: true,
        set: function(val) {
          // allow set to overwrite the property
          utils.define(this, 'local', val);
        },
        get: function fn() {
          // lazily create a namespaced store for the current project
          if (fn.store) return fn.store;
          fn.store = this.create();
          return fn.store;
        }
      });
    };
  });
}

/**
 * Listen for events on `app`
 *
 * @param {Object} app
 * @param {Object} options
 */

function listen(app, options) {
  options = options || {};
  var cwds = [app.cwd];

  app.on('option', function(key, val) {

    if (key === 'cwd') {
      val = path.resolve(val);

      if (cwds[cwds.length - 1] !== val) {
        var dir = utils.magenta('~/' + utils.homeRelative(val));
        utils.timestamp(`changing cwd to ${dir}`);
        cwds.push(val);
      }
    }
  });
}
