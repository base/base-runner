'use strict';

var debug = require('../debug')('config:reflinks');

module.exports = function(app) {
  return function(val, key, config, next) {
    app.debug('command > %s: "%j"', key, val);

    debug('adding reflinks "%j"', val);
    next();
  };
};
