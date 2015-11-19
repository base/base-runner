'use strict';

var utils = require('./utils');
var generator = require('./generator');
var register = require('base-register');
var Base = require('assemble-core');

/**
 * Expose `Generate`
 */

module.exports = Generate;
// module.exports = require('generate');


/**
 * Create an instance of `Generate` with the given `options`.
 *
 * ```js
 * var generators = new Generate();
 * ```
 * @param {Object} `options`
 * @api public
 */

function Generate(options) {
  if (!(this instanceof Generate)) {
    return new Generate(options);
  }

  Base.call(this);
  this.options = options || {};
  this.isGenerate = true;
  this.isGenerator = false;
  this.generators = {};
  this.config = {};

  this.use(generator());
  this.use(register(this.Generator, {
    method: 'generator'
  }));
}

/**
 * Inherit 'Base'
 */

Base.extend(Generate);

/**
 * Load multiple generators.
 *
 * ```js
 * generators.loadGenerators({
 *   'a.js': {path: '...'},
 *   'b.js': {path: '...'},
 *   'c.js': {path: '...'}
 * });
 * ```
 * @param {Object|Array} `generators`
 * @return {Object} returns the instance for chaining
 * @api public
 */

Generate.prototype.loadGenerators = function(generators, options) {
  for (var key in generators) {
    this.generator(key, options, generators[key]);
  }
  return this;
};

/**
 * Get an generator from the generators.
 *
 * ```js
 * generators.getGenerator('a.html');
 * ```
 * @param {String} `key` Key of the generator to get.
 * @return {Object}
 * @api public
 */

Generate.prototype.getGenerator = function(key) {
  return this.generators[key] || this.generators[this.alias(key)];
};
