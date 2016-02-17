'use strict';

var debug = require('../debug');
var errors = require('../errors');
var utils = require('../utils');
var cached = {};

function normalize(app) {
  return function(val, key, options, schema) {
    debug.field(key, val);

    if (!utils.hasValue(val)) return;
    if (cached[key]) return cached[key];

    var pluginOpts = {};
    if (utils.isObject(val)) {
      if (!Object.keys(val).length) {
        return;
      }

      pluginOpts = val;
      val = Object.keys(val);
    }

    var res = {};

    if (Array.isArray(val)) {
      var arr = [];
      var len = val.length;
      var idx = -1;

      while (++idx < len) {
        var name = val[idx];
        var orig = name;

        if (name.indexOf('./') === 0) {
          name = app.pkg.get('name');
        }

        app.option(['plugin', name], pluginOpts[orig] || {});
        var devDeps = app.pkg.get('devDependencies') || {};
        if (orig === name && !devDeps.hasOwnProperty(name)) {
          throw new Error(`cannot load plugin ${name} plugins must be listed in devDependencies`);
        }

        arr.push(name);

        if (!app.plugins || !app.plugins.hasOwnProperty(name)) {
          var fp = utils.tryResolve(orig, { cwd: app.cwd });

          if (typeof fp === 'undefined') {
            throw errors.moduleError(app, 'plugin', orig);
          }
          res[name] = require(fp);
        }
      }
      app.option('pipeline', arr);
    }
    cached[key] = res;
    return res;
  };
}

/**
 * Expose 'plugins' expander
 */

module.exports = normalize;
