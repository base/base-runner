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

    var helperOpts = {};
    if (utils.isObject(val)) {
      if (!Object.keys(val).length) {
        return;
      }

      helperOpts = val;
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

        app.option(['helper', name], helperOpts[name] || {});
        var devDeps = app.pkg.get('devDependencies') || {};
        if (!devDeps.hasOwnProperty(orig)) {
          throw new Error(`expected helper ${orig} to be listed in devDependencies`);
        }

        arr.push(name);

        if (!app.helpers || !app.helpers.hasOwnProperty(name)) {
          var fp = utils.tryResolve(orig, { cwd: app.cwd });

          if (typeof fp === 'undefined') {
            throw errors.moduleError(app, 'helper', orig);
          }
          res[name] = require(fp);
        }
      }
    }
    cached[key] = res;
    return res;
  };
}

function alias(name) {
  return utils.camelcase(name.replace(/helpers?-?/, ''));
}

/**
 * Expose 'helpers' expander
 */

module.exports = normalize;
