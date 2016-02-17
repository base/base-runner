'use strict';

var utils = require('../utils');

module.exports = function(app) {
  var pkg = app.option('settings.pkg');
  if (pkg) return pkg;

  var data = app.pkg.data;
  if (utils.typeOf(data[app._name]) === 'object') {
    return data[app._name];
  }

  return {};
};
