'use strict';

var fs = require('fs');
var path = require('path');
var Liftoff = require('liftoff');
var merge = require('mixin-deep');
var debug = require('debug')('base:runner');
var project = require('base-project');
var config = require('base-config-process');
var cli = require('base-cli-process');
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
  var id = (module.parent && module.parent.id) || path.resolve(__dirname, '../..');
  debug('initializing <%s>, called from <%s>', __filename, id);

  /**
   * handle runner arguments errors
   */
  var err = validateRunnerArgs(Ctor, config, argv, cb);
  if (err) {
    cb(err);
    return;
  }

  /**
   * Shallow clone options
   */

  argv = merge({_: []}, argv);
  config = merge({cwd: process.cwd(), extensions: { '.js': null }}, config);
  config.processTitle = config.processTitle || config.name;
  config.moduleName = config.moduleName || config.name;
  config.configName = config.configName || config.name + 'file';

  /**
   * Set cwd (if not defined)
   *
   *   $ app --cwd="lib"
   *
   */

  if (typeof argv.cwd === 'undefined') {
    argv.cwd = config.cwd;
  }

  /**
   * Custom config file
   *
   *   $ app --verbfile="docs/foo.js"
   *
   */

  var customFile = argv.configfile || argv[config.configName];
  if (customFile) {
    argv.configPath = path.resolve(config.cwd, customFile);
  }

  /**
   * Initialize liftoff
   */

  var CLI = new Liftoff(config);
  utils.timestamp('starting ' + config.name);

  /**
   * Load environment
   */

  CLI.launch(argv, function(env) {
    debug('launching CLI');

    env.name = config.name;
    env.configName = config.configName;
    env.configFile = env.configName + '.js';

    var ctx = new RunnerContext(argv, config, env);
    try {
      var Base = env.modulePath ? require(env.modulePath) : Ctor;
      ctx.Base = Base;

      // get the instance to use
      var base = new Base();
      base.options = merge({}, base.options, merge({}, ctx.options, argv));
      base.set('cache.runnerContext', ctx);


      // load plugins
      runner.loadPlugins(base);

      // process `argv` and set on cache
      base.set('cache.argv', base.argv(argv));
      base.set('cache.config', ctx.pkgConfig);
      base.set('cache.env', ctx);

      // load local `[config]file.js` if one exists
      runner.resolveConfig(base, config, env);
      cb(null, base, ctx);
    } catch (err) {
      console.log(err.stack);
      cb(err);
    }
  });
}

/**
 * Resolve the config file to use in the user's cwd:
 *   - verbfile.js
 *   - assemblefile.js
 *   - generator.js
 *   - updatefile.js
 */

runner.resolveConfig = function(base, config, env) {
  var filepath = path.resolve(config.cwd, env.configName);

  if (env.configPath && ~env.configPath.indexOf(filepath)) {
    utils.configPath('using', env.configPath);
    base.set('cache.configPath', env.configPath);
    base.set('cache.hasDefault', true);

    var fn = require(env.configPath);
    var gen = base.generator('default', fn);
    if (gen && gen.env && gen.env.app !== base) {
      merge(gen.cache, base.cache);
      base.use(fn);
    }
  }
};

runner.loadPlugins = function(base) {
  base.use(project());
  base.use(config());
  base.use(cli());
};

/**
 * Create runner context
 */

function RunnerContext(argv, config, env) {
  argv.tasks = argv._.length ? argv._ : ['default'];
  this.argv = argv;
  this.config = config;
  this.env = env;
  this.json = loadConfig(this.argv.cwd, this.env);
  this.pkg = loadPkg(this.argv.cwd, this.env);
  this.pkgConfig = this.pkg[env.name] || {};
  this.options = merge({}, this.pkgConfig.options, this.json.options);
}

function loadPkg(cwd, env) {
  var pkgPath = path.resolve(cwd, 'package.json');
  var pkg = {options: {}};
  if (fs.existsSync(pkgPath)) {
    pkg = require(pkgPath);
    pkg[env.name] = pkg[env.name] || {};
    pkg[env.name].options = pkg[env.name].options || {};
  }
  return pkg;
}

function loadConfig(cwd, env) {
  var jsonPath = path.resolve(cwd, '.' + env.name + 'rc.json');
  var json = {options: {}};
  if (fs.existsSync(jsonPath)) {
    json = require(jsonPath);
    json.options = json.options || {};
  }
  return json;
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
 * Expose `runner`
 */

module.exports = runner;
