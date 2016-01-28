'use strict';

var utils = require('../utils');

module.exports = function(app) {
  return function(val, next) {
    // call `base-init` first

    app.ask('init', function(err, answers) {
      if (err) return next(err);

      // do stuff
      next();
    });
  }
};
