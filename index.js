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

/**
 * Run tasks and generators based on the user's configuration
 * settings, command line options and environment.
 */

module.exports = function(options) {
  return function(app) {
    if (this.isRegistered('base-runner')) return;

    // Initialize runner plugins
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

      // process argv
      var args = createArgs(app, options, process.argv.slice(2));
      var name = (this.base && this.base.name) || this.constructor.name.toLowerCase();

      var opts = this.pkg.get(name);
      opts.argv = args;
      opts.cwd = args.cwd || opts.cwd || this.cwd;

      // var opts = createOpts(app, args);

      // listen for events
      listen(this, opts);
      this.base.set('cache.config', opts);

      // if a configfile exists in the user's cwd, load it now
      var file = resolveConfig(configfile, opts);
      if (file) {
        this.registerConfig('default', file, opts);
        this.hasConfigfile = true;
      } else {
        setDefaults(this, opts);
      }

      cb.call(this, null, opts, this);
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

function createOpts(app, args) {
  // temporarily delete tasks from args
  var tasks = args.tasks;
  delete args.tasks;

  // load the user's configuration settings
  var config = app.loadSettings(args);
  var opts = config.merge();
  // app.option(opts);

  opts.cwd = opts.cwd || app.cwd;
  app.cwd = opts.cwd;

  opts.tasks = opts.tasks || tasks;
  opts.argv = args;
  // preprocess(opts);

  app.base.set('cache.config', opts);
  app.base.set('cache.argv', args);
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

function setDefaults(app, opts) {
  var argv = opts.argv;

  if (isDefault(argv)) {
    var name = app.base && app.base.constructor.name.toLowerCase();
    var tasks = app.pkg.get([name, 'tasks']);
    if (tasks) {
      argv.tasks = tasks;
      return;
    }

    tasks = app.store.get('tasks');
    if (tasks) {
      argv.tasks = tasks.split(' ');
    }
  }
}

/**
 * Returns true if (only) the `default` task is defined
 *
 * @param {Object} `opts`
 * @return {Boolean}
 */

function isDefault(opts) {
  return opts && opts.tasks
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

function createArgs(app, options, argv) {
  var fileKeys = ['base', 'basename', 'cwd', 'dir', 'dirname', 'ext', 'extname', 'f', 'file', 'filename', 'path', 'root', 'stem'
  ];

  var alias = {
    filename: 'stem',
    dirname: 'dir',
    extname: 'ext',
    verbose: 'v',
    layout: 'l',
    config: 'c',
    file: 'f'
  };

  if (Array.isArray(argv)) {
    argv = utils.minimist(argv, {alias: alias});
  }

  return app.argv(argv, utils.extend({
    whitelist: ['emit'].concat(fileKeys),
    last: ['ask', 'tasks'],
    first: ['emit'],
    esc: fileKeys
  }, options));
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
  app.lazy('argv', plugins.argv);
  app.lazy('cli', plugins.cli);
  app.lazy('config', config);
  app.lazy('pkg', plugins.pkg);
  app.lazy('project', plugins.project);

  app.lazy('store', function() {
    return function() {
      this.use(plugins.store(this.constructor.name.toLowerCase()));

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
