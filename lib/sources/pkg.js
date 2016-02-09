'use strict';

var isFalsey = require('falsey');

module.exports = function(app, prop) {
  var config = app.pkg.get(prop) || {};
  if (typeof config.layout !== 'undefined' && isFalsey(config.layout)) {
    config.layout = 'empty';
  }
  return config;
};
