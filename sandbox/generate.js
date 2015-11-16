'use strict';

var glob = require('matched');
var unique = require('array-unique');
var Generate = require('base-methods');
var Assemble = require('assemble-core');
var Generator = require('./generator');
var ask = require('assemble-ask');
var resolveUp = require('resolve-up');
var utils = require('../lib/utils');

Generate.prototype.generator = function(name, options) {
  if (typeof name === 'string' && arguments.length === 1) {
    return this.generators[name];
  }

  this.generators = this.generators || {};
  var opts = utils.extend({}, options);
  var inst = new Assemble(opts.options)
    .set(opts)
    .use(ask())
    .use(function(app) {
      app.handlers('onStream');
    });

  this.emit('register', name, inst);
  this.generators[name] = inst;
  return inst;
};

Generate.prototype.resolve = function(patterns, opts) {
  var files = resolveUp(patterns, opts).concat(glob.sync(patterns, opts));
  return unique(files);
};

Generate.prototype.register = function(name, options, fn) {
  if (!fn && utils.isObject(options) && options.fn) {
    this.generator(name, options);
    return this;
  }
  var config = new Generator(name, options);
  this.generator(config.alias, config);
  return this;
};

Generate.prototype.registerUp = function(patterns, opts) {
  var dirs = this.resolve(patterns, opts);
  var len = dirs.length, i = -1;

  while (++i < len) {
    this.register(dirs[i], opts);
  }
  return this;
};

Generate.prototype.registerLocal = function(patterns, opts) {
  var dirs = utils.glob.sync(patterns, opts);
  var len = dirs.length, i = -1;

  while (++i < len) {
    this.register(dirs[i], opts);
  }
  return this;
};

/**
 * Expose Generate
 */

module.exports = Generate;
