'use strict';

var path = require('path');
var utils = require('../utils');

module.exports = function(app, filename) {
  var configname = path.basename(filename, path.extname(filename));
  var configpath = path.resolve(app.cwd, configname + '.json');
  if (utils.exists(configpath)) {
    return require(configpath);
  }
  return {};
};
