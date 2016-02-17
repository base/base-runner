'use strict';

var debug = require('../debug');
var utils = require('../utils');

function normalize(app) {
  return function(val, key, options, schema) {
    debug.field(key, val);

    if (!utils.hasValue(val)) return;
    for (var prop in val) {
      if (typeof app[prop] !== 'function') {
        app.create(prop, val[prop]);
      }
    }
  };
}

/**
 * Expose 'plugins' expander
 */

module.exports = normalize;
