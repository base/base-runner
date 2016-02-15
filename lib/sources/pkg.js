'use strict';

var isFalsey = require('falsey');

module.exports = function(app, prop) {
  return app.pkg.get(prop) || {};
};
