'use strict';

module.exports = function(app) {
  return function(val, key, config, next) {
    app.debug('command > %s: "%j"', key, val);
    app.cwd = val;
    app.emit('cwd', val);
    next();
  };
};
