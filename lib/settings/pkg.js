'use strict';

var utils = require('../utils');

module.exports = function(app) {
  var pkg = app.option('settings.pkg');
  if (pkg) return pkg;

  return app.get(['pkg.data', app._name]) || {};
};
