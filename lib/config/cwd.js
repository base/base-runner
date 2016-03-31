'use strict';

var path = require('path');

/**
 * Set the current working directory.
 *
 * ```json
 * {
 *   "name": "my-project",
 *   "verb": {
 *     "cwd": "foo/bar"
 *   }
 * }
 * ```
 * @name cwd
 * @api public
 */

module.exports = function(app) {
  return function(val, key, config, next) {
    app.debug('command > %s: "%j"', key, val);
    app.cwd = path.resolve(val);
    app.emit('cwd', app.cwd);
    next();
  };
};
