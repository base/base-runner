'use strict';

var debug = require('../debug')('config:plugins');

/**
 * Load pipeline plugins. Requires the [base-pipeline][] plugin to be
 * registered.
 *
 * _(Modules must be locally installed and listed in `dependencies` or
 * `devDependencies`)_.
 *
 * ```json
 * {"verb": {"plugins": {"eslint": {"name": "gulp-eslint"}}}}
 * ```
 * @name plugins
 * @api public
 */

module.exports = function(app) {
  return function(plugins, key, config, next) {
    if (!app.plugin) {
      next();
      return;
    }

    for (var key in plugins) {
      if (plugins.hasOwnProperty(key) && !this.plugins[key]) {
        debug('loading plugin "%s"', key);
        this.plugin(key, plugins[key]);
      }
    }
    next();
  };
};
