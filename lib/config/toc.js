'use strict';

var debug = require('../debug')('config:toc');

module.exports = function(app) {
  return function(val, next) {
    debug('normalizing toc "%j"', val);
    if (typeof val === 'boolean') {
      val = { render: val };
    }
    app.option('toc', val);
    next();
  };
};
