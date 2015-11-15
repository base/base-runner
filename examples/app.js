
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
  // Composer.call(this, 'generate');
  this.options = options || {};

  if (!this.options.path) {
    this.options.path = __dirname;
  }

  this.handler('onStream');

  this.use(option());
  this.use(plugins());
  this.use(ask());
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
 * Inherit `Generate` and `Composer`
 */

Base.extend(Generate);
// Base.inherit(Generate, Composer);

/**
 * Expose Generate
 */

module.exports = Generate;

/**
 * Expose Generate
 */

module.exports.__dirname = __dirname;
