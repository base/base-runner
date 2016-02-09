'use strict';

var debug = require('debug');

module.exports = function(prop) {
  return debug('base:runner:' + prop);
};
