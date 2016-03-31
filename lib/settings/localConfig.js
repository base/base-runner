'use strict';

var path = require('path');
var utils = require('../utils');

module.exports = function(app, filename) {
  var localConfig = app.option('settings.localConfig');
  if (utils.typeOf(localConfig) === 'object') {
    return localConfig;
  }

  if (!filename) filename = app._name;
  var configname = path.basename(filename, path.extname(filename));
  var configpath = path.resolve(app.cwd, configname + '.json');
  if (utils.exists(configpath)) {
    return require(configpath);
  }
  configpath = path.resolve(app.cwd, '.' + configname + 'rc.json');
  if (utils.exists(configpath)) {
    return require(configpath);
  }
  return {};
};
