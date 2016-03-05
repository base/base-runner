'use strict';

var debug = require('../debug');
var utils = require('../utils');
var created = {};

module.exports = function(app) {
  return function(obj, key, options, schema) {
    if (utils.isEmpty(obj)) return;

    debug.field(key, obj);
    if (typeof app.create !== 'function') {
      throw new Error('expected app.create to be a function. use the `templates` library.');
    }

    for (var prop in obj) {
      if (utils.isObject(obj[prop]) && !(prop in app)) {
        // shallow clone options
        app.create(prop, utils.extend({}, obj[prop]));
      }
    }
  };
};
