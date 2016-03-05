'use strict';

var path = require('path');
var errors = require('../errors');
var debug = require('../debug');
var utils = require('../utils');
var cached = {};

function normalize(app) {
  return function(val, key, options, schema) {
    debug.schema(`normalizing field ${key}: '${val}'`);

    if (!utils.hasValue(val)) return;
    if (cached[key]) return cached[key];
    var res = {};
    switch (utils.typeOf(val)) {
      case 'array':
        res = configArray(val, key, options, schema);
        break;
      case 'object':
        res = configObject(val, key, options, schema);
        break;
      case 'string':
        res = configString(val, key, options, schema);
        break;
    }
    cached[key] = res;
    return res;
  };
}

function configString(val, key, options, schema) {
  var res = {};
  var obj = { key: val };

  if (val.indexOf('./') === 0) {
    obj.path = path.resolve(val);
  }

  res[val] = obj;
  return normalize(res, key, options, schema);
}

function configObject(obj, key, options, schema) {
  var app = schema.options.app;
  var res = {};

  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      var val = obj[prop];
      if (val.isNormalized) {
        res[prop] = val;
        continue;
      }

      if (app[key] && typeof app[key][prop] === 'function') {
        val.fn = app[key][prop];

      } else if (typeof val === 'string' && key === prop) {
        if (val.indexOf('./') === 0) {
          val = path.resolve(val);
        }

        var o = utils.tryRequire(path.resolve(val));
        if (typeof o === 'function') {
          val.fn = o;
        }

        if (o && typeof o === 'object') {
          for (var k in o) {
            var v = o[k];
            res[k] = { fn: v, name: k };
          }
          continue;
        }
      }

      if (typeof val === 'string') {
        val = { name: val };
      }

      var name = val.name || prop;
      var alias = toAlias(key, prop);
      delete val.name;

      var opts = val.options || { options: val, name: name };
      if (val.hasOwnProperty('path')) {
        opts.path = path.resolve(val.path);
        delete val.path;
      }

      var modulename = opts.path || opts.name;
      if (typeof val.fn !== 'function') {
        var fn = utils.tryRequire(modulename);
        var fp;

        if (!fn) {
          fp = path.resolve(app.cwd, 'node_modules', modulename);
          fn = utils.tryRequire(fp);
          if (fn) opts.path = fp;
        }

        if (typeof fn === 'undefined') {
          errors.configError(app, modulename, key);
          continue;
        }
        opts.fn = val.fn || fn;
      }
      opts.isNormalized = true;
      res[alias] = opts;
    }
  }
  return res;
}

function configArray(val, key, options, schema) {
  var len = val.length;
  var idx = -1;
  var res = {};
  while (++idx < len) {
    utils.merge(res, normalize(val[idx], key, options, schema));
  }
  return res;
}

function toAlias(prefix, key) {
  if (key.length === 1) return key;
  var re = new RegExp('^(' + inflections(prefix) + ')(\\W+)?');
  return key.replace(re, '');
}

function inflections(key) {
  var single = utils.inflect.singularize(key);
  var plural = utils.inflect.pluralize(key);
  return [single, plural].join('|');
}

/**
 * Expose 'plugins' expander
 */

module.exports = normalize;
