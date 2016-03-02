'use strict';

var utils = require('../utils');

/**
 * Merge options onto the `app.options` object. If the [base-option][] plugin
 * is registered, this is the API-equivalent of calling `app.option()`.
 *
 * ```json
 * {"verb": {"options": {"foo": "bar"}}}
 * ```
 * @name options
 * @api public
 */

module.exports = function(app) {
  return function(val, key, config, next) {
    app.debug('command > %s: "%j"', key, val);
    if (typeof app.option === 'function') {
      app.option(val);

    } else if (utils.typeOf(val) === 'object') {
      app.options = utils.merge({}, app.options, val);

      for (var prop in val) {
        app.emit('option', prop, val[prop]);
      }
    }
    next();
  };
};
