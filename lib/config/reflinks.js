'use strict';

var debug = require('../debug')('config:reflinks');
var utils = require('../utils');

module.exports = function(app) {
  return function(val, key, config, next) {
    app.debug('command > %s: "%j"', key, val);

    debug('adding reflinks "%j"', val);
    val = utils.flatten(val);

    config[key] = val;
    next();
  };
};
