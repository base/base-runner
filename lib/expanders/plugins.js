'use strict';

var debug = require('../debug');
var errors = require('../errors');
var utils = require('../utils');
var cached = {};

module.exports = function(app) {
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
        var prop = val[idx];
        var orig = prop;
        var name;

        if (orig.indexOf('./') === 0) {
          name = app.pkg.get('name');
        } else {
          name = alias(prop);
        }

        app.option(['plugin', name], pluginOpts[name] || {});
        var devDeps = app.pkg.get('devDependencies') || {};
        if (!devDeps.hasOwnProperty(orig)) {
          var err = 'expected plugin "' + orig + '" to be listed in devDependencies';
          throw new Error(err);
        }

        arr.push(name);

        if (!app.plugins || !app.plugins.hasOwnProperty(name)) {
          var fp = utils.tryResolve(orig, {cwd: app.cwd});

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

function alias(name) {
  return utils.camelcase(name.replace(/(verb|assemble|gulp)?-?/, ''));
}
