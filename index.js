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
     * @param {Function} `callback` Callback that exposes `err`, `argv` and `app` as arguments. `argv` is pre-processed by [minimist][] then processed by [expand-args][]. The original `argv` array is exposed on `argv.orig`, and the object returned by minimist is exposed on `argv.minimist`. `app` is the resolved application instance to be used.
     * @return {undefined}
     * @api public
     */

    this.define('runner', function(configfile, cb) {
      debug('runner args: "%j"', arguments);

      // set the configfile to use
      this.option('configfile', configfile);
      this.configfile = configfile;

      try {
        var configOpts = utils.extend({}, config, this.options);

        // process argv
        var args = createArgs(app, configOpts, process.argv.slice(2));
        var opts = createOpts(app, configOpts, args);

        // listen for events
        listen(this, opts);

        // if a configfile exists in the user's cwd, load it now
        var file = resolveConfig(configfile, opts);
        if (file) {
          this.registerConfig('default', file, opts);
          this.hasConfigfile = true;
        } else {
          setDefaults(this, opts);
        }
      } catch (err) {
        cb.call(this, err);
        return;
      }

      this.option(opts);

      var sortedArgs = this.sortArgs(opts, {
        keys: this.cli.keys,
        last: ['ask', 'tasks'],
        first: ['emit', 'save']
      });

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
  if (isDefaultTask(args)) {
    delete args.tasks;
  }

  // load the user's configuration settings
  var config = app.loadSettings(args);
  var opts = utils.omitEmpty(config.merge());
  opts = utils.extend({}, configOpts, opts);

  opts.cwd = opts.cwd || app.cwd;
  opts.tasks = args.tasks || opts.tasks || tasks;

  if (len >= 1 && !opts.run && !isWhitelisted(opts)) {
    opts.tasks = null;
  }

  args.tasks = opts.tasks;
  app.isDefaultTask = isDefaultTask(args);
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
  var configpath = path.resolve(opts.cwd, opts.file || opts.configfile || configfile);
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
  if (isDefaultTask(opts)) {
    var tasks = app.store.get('tasks');
    if (tasks) {
      opts.tasks = tasks.split(' ');
    }
  }
}

/**
 * Returns true if (only) the `default` task is defined
 *
 * @param {Object} `opts`
 * @return {Boolean}
 */

function isDefaultTask(opts) {
  return opts.tasks
    && opts.tasks.length === 1
    && opts.tasks[0] === 'default';
}

/**
 * Move certain properties onto `config` so they're processed
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
    verbose: 'v',
    file: 'f'
  };

  if (Array.isArray(argv)) {
    argv = utils.minimist(argv, {alias: alias});
  }

  return app.argv(argv, utils.extend({
    whitelist: utils.whitelist,
    last: ['ask', 'tasks'],
    first: ['emit', 'save'],
    esc: utils.fileKeys
  }, configOpts));
}

function isWhitelisted(argv) {
  var keys = utils.whitelist;
  for (var key in argv) {
    if (~keys.indexOf(key)) return true;
  }
  return false;
}

/**
 * Initialize runner plugins
 *
 * @param {Object} `app` base app instance
 */

function initPlugins(app) {
  app.use(plugins.cwd());
  app.use(settings());

  // Register lazily invoked plugins
  app.lazy('project', plugins.project);
  app.lazy('pkg', plugins.pkg);
  app.lazy('cli', plugins.cli);
  app.lazy('config', config);
  app.lazy('argv', plugins.argv);
  app.lazy('store', function() {
    return function() {
      this.use(plugins.store(this._name.toLowerCase()));

      Object.defineProperty(this.store, 'local', {
        configurable: true,
        set: function(v) {
          // allow set to overwrite the property
          utils.define(this, 'local', v);
        },
        get: function fn() {
          // lazily create a namespaced store for the current project
          if (fn.store) return fn.store;
          fn.store = this.create();
          fn.store.set(app.pkg.data);
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
    if (key === 'cwd' && cwds[cwds.length - 1] !== val) {
      console.log('changing cwd to "%s"', val);
      cwds.push(val);
    }
  });

  app.on('task:skipping', function() {
    if (app.disabled('silent')) {
      console.error('no default task defined, skipping.');
    }
  });

  if (options.verbose) {
    app.on('error', function(err) {
      console.error(err);
    });
  }
}

