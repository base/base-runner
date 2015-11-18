'use strict';

var ask = require('assemble-ask');
var Generate = require('assemble-core');
var Config = require('./generator');
var utils = require('../lib/utils');

Generate.prototype.generator = function(name, options) {
  if (typeof name === 'string' && arguments.length === 1) {
    return this.generators[name];
  }

  this.generators = this.generators || {};
  var opts = utils.extend({}, options);
  var inst = new Generate(opts.options)
    .set(opts)
    .use(ask())
    .use(function(app) {
      app.handlers('onStream');
    });

  this.emit('register', name, inst);
  this.generators[name] = inst;
  return inst;
};

Generate.prototype.register = function(name, options, fn) {
  if (utils.hasGlob(name)) {
    utils.resolve(name, options).forEach(function(fp) {
      this.register(fp, options);
    }.bind(this));
    return this;
  }
  if (!fn && utils.isObject(options) && options.fn) {
    this.generator(name, options);
    return this;
  }

  var config = new Config(name, options);
  this.generator(config.alias, config);
  return this;
};

/**
 * Expose Generate
 */

module.exports = Generate;
