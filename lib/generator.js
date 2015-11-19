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
   * Inherit Runner
   */

  Runner.extend(Generator);

  /**
   * Expose `Generator`
   */

  return Generator;
};
