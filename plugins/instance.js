'use strict';

var utils = require('../lib/utils');

/**
 * This is a "base" plugin
 */

module.exports = function instance(options) {
  var opts = createOptions(options);
  var method = opts.method;
  var filename = opts.filename;
  var subname = opts.subname;

  return function (app) {
    app.define(opts.method, function(name, opts, fn) {
      if (typeof opts === 'function') {
        fn = opts;
        opts = {};
      }
      opts = opts || {};

      var nickname = utils.renameFn(name, this.options);
      var Ctor = opts.Ctor || this.constructor;
      var child = new Ctor()
        .option('nickname', nickname)
        .option('appname', opts.appname || name)
        .option('path', opts.path || './');

      child.define('runner', this.runner);

      fn.call(this.runner, child, this, this.runner);
      this[this.runner.plural][name] = child;
      return child;
    });

    app.define(subname, function(name, dir) {
      var config = this.runner.resolveModule(filename, dir);
      return this[method](config.appname, config, config.fn);
    });
  };
};

function createOptions(options) {
  var opts = utils.extend({}, options);

  if (typeof opts.method !== 'string') {
    throw new TypeError('expected options.method to be a string.');
  }

  opts.filename = opts.filename || opts.method + '.js';
  opts.subname = opts.subname || 'sub' + opts.method;
  return opts;
}
