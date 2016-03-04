'use strict';

var fs = require('fs');
var path = require('path');
var utils = require('../utils');
var debug = require('../debug');

function normalize(app) {
  var cached = {};
  return function(val, key, options, schema) {
    if (cached[key]) return cached[key];

    if (utils.isEmpty(val)) {
      return {};
    }

    debug.field(key, val);
    if (typeof val === 'string') {
      val = [val];
    }

    if (Array.isArray(val)) {
      return val.reduce(function(acc, v) {
        acc[v] = normalize(v, key, options, schema);
      }, {});
    }

    if (typeof val === 'object') {
      var collections = val;

      for (var name in collections) {
        if (collections.hasOwnProperty(name)) {
          var views = collections[name];

          if (!(name in app)) {
            app.create(name);
          }

          // object of views
          if (utils.isObject(views)) {
            for (var prop in views) {
              var val = views[prop];
              if (typeof val === 'string') {
                var str = fs.readFileSync(val);
                app[name].addView(prop, {content: str});
              }
            }
            continue;
          }

          // filepath
          if (typeof views === 'string' || Array.isArray(views)) {
            if (utils.hasGlob(views)) {
              var files = utils.glob.sync(views, { cwd: app.cwd });
              if (!files.length) continue;

              files.forEach(function(fp) {
                app[name].addView(fp, {content: fs.readFileSync(fp)});
              });
              continue;
            }

            var obj = utils.tryRequire(path.resolve(views));
            if (obj) app[name].addViews(obj);
          }
        }
      }
    }

    // temporary, need to figure out why this is being
    // called more than once
    cached[key] = {};
    return {};
  };
}

/**
 * Expose normalize
 */

module.exports = normalize;
