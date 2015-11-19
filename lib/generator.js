'use strict';

var fs = require('fs');
var path = require('path');
var utils = require('./utils');

module.exports = function generator(config) {
  config = config || {};

  return function(app) {
    var Generate = app.constructor;

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

      Generate.call(this);
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

    if (config.inspectFn !== false) {
      Generator.prototype.inspect = function() {
        var tasks = Object.keys(this.tasks).join(', ') || 'none';
        return '<Generator "' + this.alias + '" <tasks: ' + tasks + '>>';
      };
    }

    /**
     * Inherit Generate
     */

    Generate.extend(Generator);


    /**
     * Expose `Generator`
     */

    this.define('Generator', Generator);
  };
};
