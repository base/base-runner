'use strict';

var path = require('path');
var utils = require('./utils');

module.exports = function generator(Runner, config) {
  config = config || {};
  var paths = {};

  /**
   * Create an instance of `Generator`, optionally passing
   * a default object to initialize with.
   *
   * ```js
   * var app = new Generator({
   *   path: 'foo.html'
   * });
   * ```
   * @param {Object} `app`
   * @api public
   */

  function Generator(name, options, parent, fn) {
    if (!(this instanceof Generator)) {
      return new Generator(options);
    }

    if (typeof options === 'function') {
      fn = options;
      options = {};
    }

    Runner.call(this);

    this.isGenerator = true;
    this.option(config);
    this.option(options || {});

    this.files = this.views;
    utils.define(this, 'cache', this.cache);
    utils.define(this, 'views', this.views);

    paths.path = name;
    this.paths = paths;
    this.fn = fn;

    if (!this.options.configfile) {
      this.option('configfile', 'generate.js');
    }
  }

  /**
   * Set `key` on the instance with the given `value`.
   *
   * @param {String} `key`
   * @param {Object} `value`
   * @return {Object} Returns the instance for chaining
   */

  Generator.prototype.set = function(key, value) {
    utils.set(this, key, value);
    return this;
  };

  /**
   * Custom `inspect` method.
   */

  if (config.inspectFn === true) {
    Generator.prototype.inspect = function() {
      var inspect = '"' + (this.name || this.alias) + '"';
      return '<Generator ' + inspect + '>';
    };
  }

  /**
   * Get the `path` for the generator.
   */

  utils.define(Generator.prototype, 'path', {
    set: function(fp) {
      paths.path = fp;
    },
    get: function() {
      var fp = paths.path || process.cwd();
      return (paths.path = fp);
    }
  });

  /**
   * Get the `name` for the generator.
   */

  utils.define(Generator.prototype, 'name', {
    set: function(name) {
      paths.name = name;
    },
    get: function() {
      var name = paths.name || utils.nameFn(this.path, this.options);
      return (paths.name = name);
    }
  });

  /**
   * Get the `alias` for the generator.
   */

  utils.define(Generator.prototype, 'alias', {
    set: function(alias) {
      paths.alias = alias;
    },
    get: function() {
      var alias = paths.alias || utils.aliasFn(this.name, this.options);
      return (paths.alias = alias);
    }
  });

  /**
   * Get the `cwd` (current working directory) for the generator.
   */

  utils.define(Generator.prototype, 'dirname', {
    set: function(dir) {
      paths.dirname = dir;
    },
    get: function() {
      var dir = paths.dirname || path.dirname(this.path);
      return paths.cwd || (paths.cwd = dir);
    }
  });

  /**
   * Get the `cwd` (current working directory) for the generator.
   */

  utils.define(Generator.prototype, 'cwd', {
    set: function(cwd) {
      paths.cwd = cwd;
    },
    get: function() {
      return paths.cwd || (paths.cwd = this.dirname);
    }
  });

  /**
   * Get the `configfile` for the generator.
   */

  utils.define(Generator.prototype, 'configpath', {
    set: function(configpath) {
      paths.configpath = configpath;
    },
    get: function() {
      if (paths.hasOwnProperty('configpath')) {
        return paths.configpath;
      }
      return (paths.configpath = path.join(this.cwd, this.configfile));
    }
  });

  /**
   * Inherit Runner
   */

  Runner.extend(Generator);

  /**
   * Expose `Generator`
   */

  return Generator;
};
