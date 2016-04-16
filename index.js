'use strict';

const path = require('path');
const debug = require('debug')('base:runner');
const Time = require('time-diff');

const cli = require('base-cli-process');
const cfg = require('base-config-process');
const runtimes = require('base-runtimes');
const extend = require('extend-shallow');
const Liftoff = require('liftoff');
const utils = require('./utils');

module.exports = function(Ctor, config, argv, cb) {
  debug('initializing <%s>, called from <%s>', __filename, module.parent.id);

  /**
   * handle runner arguments errors
   */

  var err = handleRunnerErrors(Ctor, config, argv, cb);
  if (err) {
    cb(err);
    return;
  }

  /**
   * Start timings
   */

  const time = new Time(argv);
  const diff = time.diff('init', argv);
  diff('modules loaded');

  /**
   * Shallow clone options
   */

  argv = extend({_: []}, argv);
  config = extend({cwd: process.cwd()}, config);

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
   * Initialize lift-off
   */

  utils.timestamp('initializing ' + config.name);
  var CLI = new Liftoff(config);
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

      var emit = emitter(Base);
      emit('preInit', ctx);

      /**
       * Create our `base` instance
       */

      var base = new Base(argv);
      base.cwd = env.cwd;
      handleAppErrors(base, env);

      emit('init', ctx);
      diff('application initialized');

      /**
       * Load plugins onto the `base` instance
       */

      base.use(runtimes());
      base.use(cfg());
      base.use(cli(argv));
      diff('plugins loaded');

      /**
       * Set `runnerContext`
       */

      base.set('cache.runnerContext', ctx);

      /**
       * Resolve configfile in the user's cwd (`assemblefile.js`, etc)
       */

      var configpath = path.resolve(config.cwd, env.configName);
      if (env.configPath && ~env.configPath.indexOf(configpath)) {
        utils.configPath('using ' + env.configName, env.configPath);
        base.generator('default', env.configPath);
      }

      diff('initialized ' + config.name);
      emit('post-init', ctx);

      process.nextTick(function() {
        emit('finished', ctx);
        diff('finished');
        cb(null, base, ctx);
      });

    } catch (err) {
      cb(err);
    }
  });
};

function handleAppErrors(app, env) {
  app.on('error', function(err) {
    if (err.message === 'no default task defined') {
      console.warn('No tasks or generators defined, stopping.');
      process.exit();
    }
    console.error(err.stack);
    process.exit(1);
  });
}

function handleRunnerErrors(Ctor, config, argv, cb) {
  if (typeof cb !== 'function') {
    throw new Error('expected a callback function');
  }
  if (argv == null || typeof argv !== 'object') {
    return new Error('expected the third argument to be an options object');
  }

  if (config == null || typeof config !== 'object') {
    return new Error('expected the second argument to be a lift-off config object');
  }

  if (typeof Ctor !== 'function' || typeof Ctor.namespace !== 'function') {
    return new Error('expected the first argument to be a Base constructor');
  }
}

function emitter(Base) {
  return function(name) {
    var args = [].slice.call(arguments, 1);
    args.unshift()
    Base.emit.bind(Base, 'runner:' + name).apply(Base, args);
    Base.emit.bind(Base, 'runner').apply(Base, arguments);
  }
}

/**
 * Create context
 */

function RunnerContext(argv, config, env) {
  argv.tasks = argv._.length ? argv._ : ['default'];
  this.argv = argv;
  this.config = config;
  this.env = env;
}
