'use strict';

var normalize = require('../normalize');
var errors = require('../errors');
var debug = require('../debug');
var utils = require('../utils');

module.exports = function(app, options) {
  return function(val, key, config, schema) {
    return val;
  };
}
