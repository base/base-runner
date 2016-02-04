/*!
 * base-runner <https://github.com/jonschlinkert/base-runner>
 *
 * Copyright (c) 2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var path = require('path');
var debug = require('debug')('base:runner');
var utils = require('./lib/utils');

module.exports = function(options) {
  return function(app) {
    if (this.isRegistered('base-runner')) return;

    // register plugins
    this.use(utils.cwd());
    this.use(utils.runtimes());

    // Register lazily invoked plugins
    this.lazy('project', utils.project);
    this.lazy('pkg', utils.pkg);
    this.lazy('cli', utils.cli);
    this.lazy('argv', utils.argv);
    this.lazy('store', function() {
      return function() {
        this.use(utils.store(this.constructor.name.toLowerCase()));

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
     * @param {Function} `cb` Callback that exposes `err`, `argv` and `app` as arguments. `argv` is pre-processed by [minimist][] then processed by [expand-args][]. The original `argv` array is exposed on `argv.orig`, and the object returned by minimist is exposed on `argv.minimist`. `app` is the resolved application instance to be used.
     * @return {undefined}
     * @api public
     */

    this.define('runner', function(configfile, cb) {
      debug('runner args: "%j"', arguments);

      var args = createArgs(app, options, process.argv.slice(2));
      var opts = utils.extend({ cwd: this.cwd }, app.options, options, args);
      listen(this, opts);

      var file = resolveConfig(configfile, opts);
      if (file) {
        this.registerConfig('default', file);
      }

      cb.call(this, null, args, this);
    });
  };
};

function resolveConfig(configfile, opts) {
  var configpath = path.resolve(opts.cwd, opts.file || opts.configfile || configfile);
  if (utils.exists(configpath)) {
    return configpath;
  }
}

function createArgs(app, options, argv) {
  if (Array.isArray(argv)) {
    argv = utils.minimist(argv, {alias: {verbose: 'v', file: 'f'}});
  }
  return app.argv(argv, {
    whitelist: ['emit', 'cwd', 'file', 'f', 'verbose', 'v', 'config'],
    last: ['ask', 'tasks'],
    first: ['emit']
  });
}

function listen(app, options) {
  options = options || {};
  app.on('task:skipping', function() {
    if (!app.enabled('silent')) {
      console.error('no default task defined, skipping.');
    }
  });
  if (options.verbose) {
    app.on('error', function(err) {
      console.error(err);
    });
  }
}
