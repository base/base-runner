'use strict';

var path = require('path');
var util = require('util');
var errors = require('./errors');
var debug = require('./debug');
var utils = require('./utils');

function normalize(val, key, options, schema) {
  debug.schema('normalizing field %s: %s', key, util.format(val, null, 2));
  var result = {};
  switch (utils.typeOf(val)) {
    case 'array':
      result = configArray(val, key, options, schema);
      break;
    case 'object':
      result = configObject(val, key, options, schema);
      break;
    case 'string':
      // result = configString(val, key, options, schema);
      result = configPath(val, key) || configModule(val, key);
      break;
    case 'function':
    default:
      result = configFunction(val);
      break;
  }
  return result;
}

function configFunction(val) {
  return { fn: val };
}

function configString(val, key, options, schema) {
  var result = {};
  try {
    result.fn = require(val);
  } catch (err) {}

  try {
    result.fn = require(path.resolve(val));
  } catch (err) {}

  return result;
}

function configObject(obj, key, options, schema) {
  var app = schema.options.app;
  var result = {};
  for (var prop in obj) {
    result[prop] = normalize(obj[prop], key, options, schema);
  }
  return result;
}

function configArray(arr, key, options, schema) {
  var len = arr.length;
  var idx = -1;
  var res = {};
  while (++idx < len) {
    var ele = arr[idx];
    var val = toObject(ele, key);
    res = utils.merge({}, res, val);
    // var out = normalize(arr[idx], key, options, schema);
  }
  return res;
}

function toAlias(prefix, key) {
  if (!key || key && key.length === 1) {
    return key;
  }
  var re = new RegExp('^(' + inflections(prefix) + ')(\\W+)?');
  return key.replace(re, '');
}

function inflections(key) {
  var single = utils.inflect.singularize(key);
  var plural = utils.inflect.pluralize(key);
  return [single, plural].join('|');
}

function toObject(val, key) {
  var res;

  switch(utils.typeOf(val)) {
    case 'string':
      res = configModule(val, key) || configPath(val, key);
      break;
    case 'object':
      break;
    case 'array':
      break;
    case 'function':
    default:
      break;
  }
  return res;
}

function configPath(fp, key) {
  try {
    var obj = {};
    var val = require(path.resolve(fp));
    fp = path.basename(fp, path.extname(fp));
    if (typeof val === 'function') {
      obj[toAlias(key, fp)] = { fn: val };
      return obj;
    }

    if (utils.isObject(val)) {
      var obj = val;
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          var val = obj[key];
          if (typeof val === 'function') {
            obj[key] = { fn: val };
          }
        }
      }
      return obj;
    }
  } catch (err) {}
}

function configModule(name, key) {
  try {
    var obj = {};
    var val = require(name);
    if (typeof val === 'function') {
      obj[toAlias(key, name)] = { fn: val };
      return obj;
    }
    if (utils.isObject(val)) {
      return val
    }
    return obj;
  } catch (err) {}
}

/**
 * Expose 'plugins' expander
 */

module.exports = normalize;
