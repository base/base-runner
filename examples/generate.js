
var cli = require('base-cli');
var ask = require('assemble-ask');
var Base = require('assemble-core');
var option = require('base-options');
var plugins = require('base-plugins');
var Composer = require('composer');
var plugin = require('../plugins');

function Generate(options) {
  if (!(this instanceof Generate)) {
    return new Generate(options);
  }

  Base.call(this);
  this.options = options || {};

  if (!this.options.path) {
    this.options.path = __dirname;
  }

  this.handler('onStream');

  this.use(option());
  this.use(plugins());
  this.use(ask());
  this.use(cli());

  this.use(plugin.decorate({
      path: this.options.path
    }))
    .use(plugin.instance({
      plural: 'generators',
      filename: 'generator.js',
      method: 'generator'
    }))
}

/**
 * Inherit `Generate` and `Composer`
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
  if (arguments.length === 1 && typeof name === 'string') {
    return this.generators[name];
  }

  var generator = new Generator(name, config);
  var alias = this.alias(name);
  generator.set('alias', alias);

  if (typeof generator.use === 'function') {
    this.run(generator);
  }
  this.generators[alias] = generator;
  return generator;
};

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

/**
 * Expose Generate
 */

module.exports = Generate;

/**
 * Expose Generate
 */

module.exports.__dirname = __dirname;
