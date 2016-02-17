'use strict';

var fs = require('fs');
var path = require('path');
var utils = require('../utils');
var debug = require('../debug');

function normalize(app) {
  return function(val, key, options, schema) {
    debug.field(key, val);

    if (!utils.hasValue(val)) return;

    if (typeof val === 'string') {
      val = [val];
    }

    if (Array.isArray(val)) {
      return val.reduce(function(acc, v) {
        acc[v] = normalize(v, key, options, schema);
      }, {});

    } else if (typeof val === 'object') {
      for (var prop in val) {
        if (val.hasOwnProperty(prop)) {
          var value = val[prop];

          if (typeof app[prop] !== 'function') {
            app.create(prop);
          }

          if (typeof value === 'string') {
            if (utils.hasGlob(value)) {
              var files = utils.glob.sync(value, {
                cwd: app.cwd
              });

              if (files.length) {
                files.forEach(function(fp) {
                  app[prop].addView(fp, {
                    content: fs.readFileSync(fp)
                  });
                });
              }
              continue;
            }

            var obj = utils.tryRequire(path.resolve(value));
            if (obj) app[prop].addViews(obj);
          }
        }
      }
    }
  };
}

/**
 * Expose 'plugins' expander
 */

module.exports = normalize;
