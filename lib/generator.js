'use strict';

var fs = require('fs');
var path = require('path');
var utils = require('./utils');

module.exports = function generator(Runner, config) {
  config = config || {};

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
    utils.define(this, 'views', this.views);

    this.cache.path = name;
    this.fn = fn;

    if (this.options.configFile) {
      this.cache.configFile = this.options.configFile;
    } else {
      this.cache.configFile = 'generate.js';
    }
  }

  /**
   * Set a path `key` on `this.cache`.
   *
   * @param {String} `key`
   * @param {Object} `value`
   * @return {Object} Returns the given value
   */

  Generator.prototype.setPath = function(key, value) {
    utils.set(this.cache, key, value);
    return value;
  };

  /**
   * Set `key` on the instance with the given `value`.
   *
   * @param {String} `key`
   * @param {Object} `value`
   * @return {Object} Returns the instance for chaining
   */

  Generator.prototype.getPath = function(key) {
    return utils.get(this.cache, key);
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
      this.cache.path = fp;
    },
    get: function() {
      var fp = this.cache.path || process.cwd();
      return (this.cache.path = fp);
    }
  });

  /**
   * Get the `name` for the generator.
   */

  utils.define(Generator.prototype, 'name', {
    set: function(name) {
      this.cache.name = name;
    },
    get: function() {
      var name = this.cache.name || utils.nameFn(this.path, this.options);
      return (this.cache.name = name);
    }
  });

  /**
   * Get the `alias` for the generator.
   */

  utils.define(Generator.prototype, 'alias', {
    set: function(alias) {
      this.cache.alias = alias;
    },
    get: function() {
      var alias = this.cache.alias || utils.aliasFn(this.name, this.options);
      return (this.cache.alias = alias);
    }
  });

  /**
   * Get the `cwd` (current working directory) for the generator.
   */

  utils.define(Generator.prototype, 'dirname', {
    set: function(dir) {
      this.cache.dirname = dir;
    },
    get: function() {
      var dir = this.cache.dirname || path.dirname(this.path);
      return this.cache.cwd || (this.cache.cwd = dir);
    }
  });

  /**
   * Get the `cwd` (current working directory) for the generator.
   */

  utils.define(Generator.prototype, 'cwd', {
    set: function(cwd) {
      this.cache.cwd = cwd;
    },
    get: function() {
      return this.cache.cwd || (this.cache.cwd = this.dirname);
    }
  });

  /**
   * Get the `configFile` for the generator.
   */

  utils.define(Generator.prototype, 'configPath', {
    set: function(configPath) {
      this.cache.configPath = configPath;
    },
    get: function() {
      if (this.cache.hasOwnProperty('configPath')) {
        return this.cache.configPath;
      }
      return (this.cache.configPath = path.join(this.cwd, this.options.configFile));
    }
  });

  /**
   * Get the `modulePath` for the constructor to use for the generator.
   */

  utils.define(Generator.prototype, 'modulePath', {
    set: function(modulePath) {
      this.cache.modulePath = modulePath;
    },
    get: function() {
      if (this.cache.hasOwnProperty('modulePath')) {
        return this.cache.modulePath;
      }

      var appname = this.options.appname || this.options.method;
      if (appname) {
        this.cache.appname = appname;
        var fp = utils.resolveModule(this.cwd, appname);
        return (this.cache.modulePath = fp);
      }
      return null;
    }
  });

  /**
   * Get the `moduleFn` for the generator.
   */

  utils.define(Generator.prototype, 'moduleFn', {
    set: function(moduleFn) {
      this.cache.moduleFn = moduleFn;
    },
    get: function() {
      if (typeof this.cache.moduleFn === 'function') {
        return this.cache.moduleFn;
      }
      var fn = this.modulePath ? require(this.modulePath) : null;
      return (this.cache.moduleFn = fn);
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
