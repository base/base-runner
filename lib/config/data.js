'use strict';

var utils = require('../utils');

module.exports = function(app) {
  return function(val, next) {
    if (typeof app.data === 'function') {
      app.data(val);

    } else if (utils.typeOf(val) === 'object') {
      app.cache.data = utils.extend({}, app.cache.data, val);

      for (var key in val) {
        if (val.hasOwnProperty(key)) {
          app.emit('data', key, val[key]);
        }
      }
    }
    next();
  };
};
