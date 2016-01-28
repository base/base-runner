'use strict';

/**
 * Support `--emit` for debugging
 *
 * Example:
 *   $ --emit data
 */

module.exports = function(app) {
  return function(val, next) {
    if (val && typeof val === 'string') {
      app.on(val, console.error.bind(console));
    }
    next();
  };
};
