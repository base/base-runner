'use strict';

var debug = require('../debug')('config:reflinks');

module.exports = function(app) {
  return function(val, next) {
    debug('adding reflinks "%j"', val);

    next();
  };
};
