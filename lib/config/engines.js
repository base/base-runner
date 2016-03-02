'use strict';

var utils = require('../utils');

module.exports = function(app) {
  return function(engine, key, config, next) {
    if (!app.engine) {
      next();
      return;
    }

    if (!utils.isObject(engine)) {
      next(new TypeError('expected engine to be an object'));
      return;
    }

    for (var key in engine) {
      var options = engine[key];
      var name;

      if (typeof options === 'string') {
        name = options;
        options = {};
      } else if (utils.isObject(options)) {
        name = options.name;
      }

      var fn = utils.tryRequire(name, app.cwd);
      if (typeof fn === 'function') {
        app.engine(key, fn, options);
      } else {
        next(new Error('cannot require engine' + key));
        return;
      }
    }

    next();
  };
};
