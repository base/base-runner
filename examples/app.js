
var Base = require('base-methods');
var option = require('base-options');
var plugins = require('base-plugins');
var cli = require('base-cli');
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

  this.use(option());
  this.use(plugins());
  this.use(cli());
  this.use(plugin.getFile({
    path: this.options.path
  }));

  this.use(plugin.instance({
    plural: 'generators',
    filename: 'generator.js',
    method: 'generator'
  }))
}

/**
 * Inherit `Generate`
 */

Base.extend(Generate);

/**
 * Expose Generate
 */

module.exports = Generate;

/**
 * Expose Generate
 */

module.exports.__dirname = __dirname;
