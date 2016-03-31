'use strict';

var debug = require('debug')('base:runner:config');
var plugins = require('./plugins');
var config = require('./config/');
var utils = require('./utils');

/**
 * Custom mappings for the base-config plugin.
 */

module.exports = function(options) {
  return function(app, base) {
    if (this.isRegistered('base-runner-config')) return;

    var opts = utils.extend({}, options, this.options);
    this.use(plugins.config(opts));

    var keys = this.option('config.omit') || [];
    for (var key in config) {
      if (!~keys.indexOf(key) && config.hasOwnProperty(key)) {
        debug('mapping config key "%s"', key);
        app.config.map(key, config[key](app, base, opts));
      }
    }
    this.config.alias('option', 'options');
  };
};
