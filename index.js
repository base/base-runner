'use strict';

const path = require('path');
const Time = require('time-diff');
const time = new Time();
time.start('load');

const cli = require('base-cli');
const runtimes = require('base-runtimes');
const Liftoff = require('liftoff');
const utils = require('./utils');

module.exports = function(Ctor, config, argv, cb) {
  utils.timestamp('initializing ' + config.name);

  var CLI = new Liftoff(config);
  var diff = utils.logTimeDiff(argv);

  diff(time, 'load', 'init: loaded requires');
  time.start('env');

  // if `configName` is passed via command line, update now
  var customFile = argv[config.configName];
  if (customFile) {
    argv.configPath = path.resolve(customFile);
  }

  CLI.launch(argv, function(env) {
    diff(time, 'env', 'init: loaded environment');
    time.start('app');

    env.name = config.name;
    env.configName = config.configName;
    env.configfile = env.configName + '.js';

    var ctx = new RunnerContext(argv, config, env);
    try {
      var Base = env.modulePath ? require(env.modulePath) : Ctor;
      var emit = emitter(Base);
      emit('pre-init', ctx);

      var base = new Base(argv);
      ctx.Base = Base;
      emit('init', ctx);

      errors(base, env);
      listen(base, argv);
      base.use(runtimes());
      base.use(cli(argv));

      ctx.base = base;
      base.set('cache.runnerContext', ctx);

      if (env.configPath) {
        utils.configPath('using ' + env.configName, env.configPath);
        base.register('default', env.configPath);
      }

      emit('post-init', ctx);
      diff(time, 'app', 'init: initialized ' + config.name);
      diff(time, 'load', 'init: finished');

      process.nextTick(function() {
        emit('finished', ctx);
        cb(base, ctx);
      });

    } catch (err) {
      if (base) {
        base.emit('error', err);
      } else {
        err.origin = __filename;
        console.error(err.stack);
        process.exit(1);
      }
    }
  });
};

function errors(app, env) {
  app.on('error', function(err) {
    if (err.message === 'no default task defined') {
      console.warn('No tasks or generators defined, stopping.');
      process.exit();
    }
    console.error(err.stack);
    process.exit(1);
  });
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
  this.argv = argv;
  this.config = config;
  this.env = env;
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
        utils.timestamp('changing cwd to ' + dir);
        cwds.push(val);
      }
    }
  });
}
