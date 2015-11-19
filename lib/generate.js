'use strict';

var Base = require('base-methods');
var plugins = require('base-plugins');
var Generator = require('./generator');
var utils = require('./utils');
var get = require('get-value');
var set = require('set-value');

/**
 * Expose `Generate`
 */

module.exports = Generate;

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
  this.generators = {};
  this.config = {};
  this.use(plugins());
}

/**
 * Inherit 'Base'
 */

Base.extend(Generate);

/**
 * Register a generator `name` on the `generators` object.
 *
 * ```js
 * generate.generator('foo', {content: 'bar'});
 * ```
 * @param {String} `name` Generator name
 * @param {Object} `config`
 * @param {Function} `fn`
 * @return {Object} returns the `generator` instance.
 * @api public
 */

Generate.prototype.generator = function(name, config) {
  var generator = new Generator(name, config);
  var alias = this.alias(name);
  generator.set('alias', alias);

  if (typeof generator.use === 'function') {
    this.run(generator);
  }
  this.generators[alias] = generator;
  return generator;
};

// Generate.prototype.generator = function(name, options, fn) {
//   var generator = new Generator(name, options, fn);
//   var alias = this.alias(name);
//   generator.set('alias', alias);

//   if (typeof generator.use === 'function') {
//     this.run(generator);
//   }
//   this.generators[alias] = generator;
//   return generator;
// };

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

/**
 * Rename function for generators.
 *
 * ```js
 * generators.alias('generator-foo');
 * ```
 * @param {String} `key` Key of the generator to get.
 * @return {Object}
 * @api public
 */

Generate.prototype.alias = function(key, options) {
  return utils.alias(key, utils.extend({}, this.options, options));
};
