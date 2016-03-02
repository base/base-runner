'use strict';

var engines = require('./engines');

module.exports = function(app) {
  return engines(app);
};
