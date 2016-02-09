'use strict';

var debug = require('../debug')('config:reflinks');

module.exports = function(app) {
  return function(val) {
    debug('adding reflinks "%j"', val);
    return Array.isArray(val) ? val : [val];
  };
};
