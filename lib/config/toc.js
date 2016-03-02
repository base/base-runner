'use strict';

/**
 * Enable or disable Table of Contents rendering, or pass options on the
 * `verb` config object in `package.json`.
 *
 * ```json
 * {
 *   "name": "my-project",
 *   "verb": {
 *     "toc": true
 *   }
 * }
 * ```
 * @name toc
 * @api public
 */

module.exports = function(app) {
  return function(val, key, config, next) {
    app.debug('command > %s: "%s"', key, val);

    if (typeof val === 'boolean') {
      val = { render: val };
    }

    app.option('toc', val);
    next();
  };
};
