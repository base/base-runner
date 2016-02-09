/*!
 * base-runner <https://github.com/jonschlinkert/base-runner>
 *
 * Copyright (c) 2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var path = require('path');
var debug = require('debug')('base:runner');
var plugins = require('./lib/plugins');
var utils = require('./lib/utils');

module.exports = function(options) {
  return function plugin(app) {
    if (this.isRegistered('base-runner')) return;
    if (!this.isApp) return;

    // register plugins
    this.use(plugins.cwd());

    // Register lazily invoked plugins
    this.lazy('project', plugins.project);
    this.lazy('pkg', plugins.pkg);
    this.lazy('cli', plugins.cli);
    this.lazy('argv', plugins.argv);
    this.lazy('store', function() {
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
      this.option('configfile', configfile);
      this.configfile = configfile;

      var args = createArgs(app, options, process.argv.slice(2));
      this.set('cache.argv', args);

      var opts = utils.extend({ cwd: this.cwd }, app.options, options, args);
      opts.argv = args;

      listen(this, opts);

      var file = resolveConfig(configfile, opts);
      if (file) {
        this.registerConfig('default', file, opts);
        this.hasConfigfile = true;
      } else {
        setDefaults(this, opts);
      }

      cb.call(this, null, opts, this);
    });

    return plugin;
  };
};

function resolveConfig(configfile, opts) {
  var configpath = path.resolve(opts.cwd, opts.file || opts.configfile || configfile);
  if (utils.exists(configpath)) {
    return configpath;
  }
}

// if `default` is set, see if the user has stored preferences
function setDefaults(app, opts) {
  var isDef = isDefault(opts);

  var argv = opts.argv;
  var keys = Object.keys(argv);
  var len = keys.length - 1; // minus `tasks`

  if (typeof argv.run === 'undefined' && len > 1) {
    opts.tasks = null;
    return;
  }

  if (isDef) {
    var tasks = app.store.get('tasks');
    if (tasks) {
      opts.tasks = tasks.split(' ');
    }
  }
}

function isDefault(opts) {
  return opts.tasks
    && opts.tasks.length === 1
    && opts.tasks[0] === 'default';
}

function createArgs(app, options, argv) {
  var fileKeys = [
    'base',
    'basename',
    'cwd',
    'dir',
    'dirname',
    'ext',
    'extname',
    'f',
    'file',
    'filename',
    'path',
    'root',
    'stem',
  ];

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
    whitelist: ['emit', 'config'].concat(fileKeys),
    last: ['ask', 'tasks'],
    first: ['emit'],
    esc: fileKeys
  }, options));
}

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

function inflect(str, arr) {
  var append = ' "' + arr.join(', ') + '"';
  if (arr.length > 1) {
    return str.split('(s)').join('s') + append;
  } else {
    return str.split('(s)').join('') + append;
  }
}
