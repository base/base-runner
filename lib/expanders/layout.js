'use strict';

var debug = require('../debug');
var utils = require('../utils');

function normalize(app) {
  return function (val, key, config, schema) {
    if (utils.isObject(val)) {
      if (!val.hasOwnProperty('name')) {
        throw new Error('expected `sections.layout` to be a string');
      }
      app.option('sections.placement', val.sections);
      app.option('sections.layout', val.name);
      val = val.name;
    }

    if (typeof val === 'string') {
      return val;
    }

    return val;
  };
}

/**
 * Expose 'plugins' expander
 */

module.exports = normalize;
