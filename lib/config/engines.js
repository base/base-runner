'use strict';

var utils = require('../utils');

/**
 * _(Requires [templates][], otherwise ignored)_
 *
 * Register engines to use for rendering templates. Object-keys are used
 * for the engine name, and the value can either be the module name, or
 * an options object with the module name defined on the `name` property.
 *
 * _(Modules must be locally installed and listed in `dependencies` or
 * `devDependencies`)_.
 *
 * ```json
 * // module name
 * {"verb": {"engines": {"*": "engine-base"}}}
 *
 * // options
 * {"verb": {"engines": {"*": {"name": "engine-base"}}}}
 * ```
 * @name engines
 * @api public
 */

module.exports = function(app) {
  return function(engine, key, config, next) {
    if (!app.engine) {
      next();
      return;
    }

    if (!utils.isObject(engine)) {
      next(new TypeError('expected engine to be an object'));
      return;
    }

    for (var key in engine) {
      var options = engine[key];
      var name;

      if (typeof options === 'string') {
        name = options;
        options = {};
      } else if (utils.isObject(options)) {
        name = options.name;
      }

      var fn = utils.tryRequire(name, app.cwd);
      if (typeof fn === 'function') {
        app.engine(key, fn, options);
      } else {
        next(new Error('cannot require engine' + key));
        return;
      }
    }

    next();
  };
};
