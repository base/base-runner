'use strict';

var debug = require('../debug')('config:plugins');

/**
 * Load pipeline plugins
 */

module.exports = function(app) {
  return function(plugins, key, config, next) {
    for (var key in plugins) {
      if (plugins.hasOwnProperty(key) && !this.plugins[key]) {
        debug('loading plugin "%s"', key);
        this.plugin(key, plugins[key]);
      }
    }
    next();
  };
};
