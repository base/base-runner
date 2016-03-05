'use strict';

var debug = require('../debug');

module.exports = function(app) {
  return function(val, key, options, schema) {
    debug.field(key, val);
    if (val === true) {
      val = { show: true };
    }
    return val;
  };
};
