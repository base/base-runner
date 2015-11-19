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
    this.cache = {};
    this.option(config);
    this.option(options || {});

    this.files = this.views;
    utils.define(this, 'views', this.views);
    this.cache.path = name;
    this.fn = fn;

    if (typeof this.fn === 'function') {
      this.invoke(this.fn);
    }
  }

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
   * Get the `configfile` for the generator.
   */

  utils.define(Generator.prototype, 'configfile', {
    set: function(configfile) {
      this.cache.configfile = configfile;
    },
    get: function() {
      if (this.cache.hasOwnProperty('configfile')) {
        return this.cache.configfile;
      }
      if (this.options.configfile) {
        this.cache.configfile = this.options.configfile;
      } else {
        this.cache.configfile = 'generate.js';
      }
      return this.cache.configfile;
    }
  });

  /**
   * Get the `configfile` for the generator.
   */

  utils.define(Generator.prototype, 'configPath', {
    set: function(configPath) {
      this.cache.configPath = configPath;
    },
    get: function() {
      if (this.cache.hasOwnProperty('configPath')) {
        return this.cache.configPath;
      }
      return (this.cache.configPath = path.join(this.cwd, this.options.configfile));
    }
  });

  /**
   * Get the `modulePath` for the constructor to use for the generator.
   */

  utils.define(Generator.prototype, 'appname', {
    set: function(appname) {
      this.cache.appname = appname;
    },
    get: function() {
      if (this.cache.hasOwnProperty('appname')) {
        return this.cache.appname;
      }
      var appname = this.options.appname || this.options.method;
      return (this.cache.appname = appname);
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
      if (this.appname) {
        var fp = utils.resolveModule(this.cwd, this.appname);
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
