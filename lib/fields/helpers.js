'use strict';

var normalize = require('../normalize');
var errors = require('../errors');
var debug = require('../debug');
var utils = require('../utils');

module.exports = function(app, options) {
  return function(val, key, config, schema) {
    debug.field(key, val);

    if (utils.isEmpty(val)) return;

    var opts = utils.merge({}, options, config);
    return normalize(val, key, opts, schema);

    // return val
    var result = {};

    // for (var key in obj) {
    //   var val = obj[key];

    // }

    // var helperOpts = {};
    // if (utils.isObject(val)) {
    //   if (!Object.keys(val).length) {
    //     return;
    //   }

    //   helperOpts = val;
    //   val = Object.keys(val);
    // }

    // var res = {};

    // if (Array.isArray(val)) {
    //   var arr = [];
    //   var len = val.length;
    //   var idx = -1;

    //   while (++idx < len) {
    //     var prop = val[idx];
    //     var orig = prop;
    //     var name;

    //     if (orig.indexOf('./') === 0) {
    //       name = app.pkg.get('name');
    //     } else {
    //       name = alias(prop);
    //     }

    //     app.option(['helper', name], helperOpts[name] || {});
    //     var devDeps = app.pkg.get('devDependencies') || {};
    //     if (!devDeps.hasOwnProperty(orig)) {
    //       throw new Error(`expected helper ${orig} to be listed in devDependencies`);
    //     }

    //     arr.push(name);

    //     if (!app.helpers || !app.helpers.hasOwnProperty(name)) {
    //       var fp = utils.tryResolve(orig, { cwd: app.cwd });

    //       if (typeof fp === 'undefined') {
    //         throw errors.moduleError(app, 'helper', orig);
    //       }
    //       res[name] = require(fp);
    //     }
    //   }
    // }
    return result;
  };
}

function alias(name) {
  return utils.camelcase(name.replace(/helpers?-?/, ''));
}
