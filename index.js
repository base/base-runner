'use strict';

var path = require('path');
var Time = require('time-diff');
var debug = require('debug')('base:runner');
var Liftoff = require('liftoff');
var utils = require('./utils');

/**
 * Create a `runner` with the given `constructor`, [liftoff][] `config` object,
 * `argv` object and `callback` function.
 *
 * ```js
 * var Base = require('base');
 * var argv = require('minimist')(process.argv.slice(2));
 * var config = {
 *   name: 'foo',
 *   cwd: process.cwd(),
 *   extensions: {'.js': null}
 * };
 *
 * runner(Base, config, argv, function(err, app, runnerContext) {
 *   if (err) throw err;
 *   // do stuff with `app` and `runnerContext`
 *   process.exit();
 * });
 * ```
 * @param {Function} `Ctor` Constructor to use, must inherit [base][].
 * @param {Object} `config` The config object to pass to [liftoff][].
 * @param {Object} `argv` Argv object, optionally pre-parsed.
 * @param {Function} `cb` Callback function, which exposes `err`, `app` (base application instance) and `runnerContext`
 * @return {Object}
 * @api public
 */

function runner(Ctor, config, argv, cb) {
  debug('initializing <%s>, called from <%s>', __filename, module.parent.id);

  /**
   * handle runner arguments errors
   */

  var err = validateRunnerArgs(Ctor, config, argv, cb);
  if (err) {
    cb(err);
    return;
  }

  /**
   * Start timings
   */

  var time = new Time(argv);
  var diff = time.diff('init', argv);
  diff('modules loaded');

  /**
   * Shallow clone options
   */

  argv = utils.merge({_: []}, argv);
  config = utils.merge({cwd: process.cwd(), extensions: {'.js': null}}, config);
  config.processTitle = config.processTitle || config.name;
  config.moduleName = config.moduleName || config.name;
  config.configName = config.configName || config.name + 'file';

  /**
   * Set cwd (if not defined)
   *
   *   $ verb --cwd="lib"
   *
   */

  if (typeof argv.cwd === 'undefined') {
    argv.cwd = config.cwd;
  }

  /**
   * Custom config file
   *
   *   $ verb --verbfile="docs/foo.js"
   *
   */

  var customFile = argv[config.configName];
  if (customFile) {
    argv.configPath = path.resolve(config.cwd, customFile);
  }

  /**
   * Initialize liftoff
   */

  var CLI = new Liftoff(config);
  utils.timestamp('initializing ' + config.name);
  diff('config loaded');

  /**
   * Load environment
   */

  CLI.launch(argv, function(env) {
    debug('launching CLI');
    diff('environment loaded');

    env.name = config.name;
    env.configName = config.configName;
    env.configFile = env.configName + '.js';

    /**
     * Create `runnerContext`
     */

    var ctx = new RunnerContext(argv, config, env);
    diff('runnerContext initialized');

    /**
     * Get the `Base` constructor to use
     */

    try {
      var Base = env.modulePath ? require(env.modulePath) : Ctor;
      ctx.Base = Base;

      var emit = emitRunnerEvents(Base);
      emit('preInit', ctx);

      /**
       * Create our `base` instance
       */

      var base = new Base(argv);
      base.cwd = env.cwd;
      handleTaskErrors(base, env);

      emit('init', base, ctx);
      diff('application initialized');

      /**
       * Load plugins onto the `base` instance
       */

      base.use(utils.project());
      base.use(utils.runtimes());
      base.use(utils.config());
      base.use(utils.cli(argv));
      diff('plugins loaded');

      /**
       * Set `runnerContext`
       */

      base.set('cache.runnerContext', ctx);

      /**
       * Resolve configfile in the user's cwd (`assemblefile.js`, etc)
       */

      runner.resolveConfig(base, config, env);
      diff('initialized ' + config.name);
      emit('postInit', base, ctx);

      /**
       * Emit `finished`, callback
       */

      process.nextTick(function() {
        emit('finished', base, ctx);
        diff('finished');
        cb(null, base, ctx);
      });
    } catch (err) {
      cb(err);
    }
  });
}

/**
 * Resolve the config file to use
 */

runner.resolveConfig = function(app, config, env) {
  var filepath = path.resolve(config.cwd, env.configName);
  if (env.configPath && ~env.configPath.indexOf(filepath)) {
    utils.configPath('using ' + env.configName, env.configPath);
    app.generator('default', env.configPath);
  }
};

/**
 * Create runner context
 */

function RunnerContext(argv, config, env) {
  argv.tasks = argv._.length ? argv._ : ['default'];
  this.argv = argv;
  this.config = config;
  this.env = env;
}

/**
 * Handle task errors
 * TODO: should this be moved to implementations?
 * (e.g. "verb/lib/commands/tasks.js")
 */

function handleTaskErrors(app, env) {
  app.on('error', function(err) {
    if (err.message === 'no default task defined') {
      var fp = path.relative(app.cwd, env.configPath);
      console.warn('No tasks or generators defined in ' + fp + ', stopping.');
      process.exit();
    }
    console.error(err.stack);
    process.exit(1);
  });
}

/**
 * Handle invalid arguments
 */

function validateRunnerArgs(Ctor, config, argv, cb) {
  if (typeof cb !== 'function') {
    throw new Error('expected a callback function');
  }
  if (argv == null || typeof argv !== 'object') {
    return new Error('expected the third argument to be an options object');
  }

  if (config == null || typeof config !== 'object') {
    return new Error('expected the second argument to be a liftoff config object');
  }

  if (typeof Ctor !== 'function' || typeof Ctor.namespace !== 'function') {
    return new Error('expected the first argument to be a Base constructor');
  }
}

/**
 * Emit `runner`
 */

function emitRunnerEvents(Base) {
  return function(name) {
    var args = [].slice.call(arguments, 1);
    args.unshift();
    Base.emit.bind(Base, 'runner:' + name).apply(Base, args);
    Base.emit.bind(Base, 'runner').apply(Base, arguments);
  };
}

/**
 * Expose `runner`
 */

module.exports = runner;
