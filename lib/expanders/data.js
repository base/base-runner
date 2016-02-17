'use strict';

var debug = require('../debug');

function normalize(app) {
  return function(val, key, options, schema) {
    debug.field(key, val);
    if (val === true) {
      val = { show: true };
    }
    return val;
  };
}

/**
 * Expose 'plugins' expander
 */

module.exports = normalize;
