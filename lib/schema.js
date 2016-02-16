'use strict';

var fs = require('fs');
var path = require('path');
var debug = require('debug')('base:runner:schema');
var fields = require('./fields');
var utils = require('./utils');
var normalized = {};

module.exports = function(config) {
  return function(app) {
    if (this.isRegistered('base-schema')) return;

    this.define('schema', function(options) {
      config = utils.extend({sortArrays: false, omitEmpty: true}, config);
      var opts = utils.extend({app: this}, config, this.options, options);

      return new utils.Schema(opts)
        // Configuration, settings and data
        .field('options', 'object')
        .field('data', ['object', 'boolean'], {
          normalize: function(val, key, config) {
            if (val === true) {
              val = { show: true };
            }
            return val;
          }
        })

        // JavaScript modules
        .field('helpers', ['array', 'object', 'string'], {
          normalize: normalize
        })
        .field('asyncHelpers', ['array', 'object', 'string'], {
          normalize: normalize
        })
        .field('engines', ['array', 'object', 'string'], {
          normalize: normalize
        })
        .field('plugins', ['array', 'object', 'string'], {
          normalize: function(val, key, options, schema) {
            if (!utils.hasValue(val)) return;
            if (normalized[key]) return normalized[key];

            var pluginOpts = {};
            if (utils.isObject(val)) {
              if (!Object.keys(val).length) {
                return;
              }

              pluginOpts = val;
              val = Object.keys(val);
            }

            debug('normalizing plugins: "%j"', val);
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
                  throw new Error('plugins must be listed in devDependencies');
                }

                arr.push(name);
                if (!app.plugins.hasOwnProperty(name)) {
                  var fp = utils.tryResolve(orig, {cwd: app.cwd});
                  if (typeof fp === 'undefined') {
                    handleModuleError(app, 'plugin', orig);
                  }
                  res[name] = require(fp);
                }
              }
              app.option('pipeline', arr);
            }
            normalized[key] = res;
            return res;
          }
        })

        // template related
        .field('create', 'object', {
          normalize: function(obj, key, options, schema) {
            if (!utils.hasValue(obj)) return;
            debug('creating template collections "%j"', obj);

            for (var prop in obj) {
              if (typeof app[prop] !== 'function') {
                app.create(prop, obj[prop]);
              }
            }
          }
        })
        .field('layout', ['object', 'string', 'boolean', 'null'])
        .field('templates', ['array', 'object'], {
          normalize: function(val, key, options, schema) {
            if (!utils.hasValue(val)) return;

            if (typeof val === 'string') {
              console.log('implement me');
            } else if (Array.isArray(val)) {
              console.log('implement me');
            } else if (typeof val === 'object') {
              for (var prop in val) {
                if (val.hasOwnProperty(prop)) {
                  var value = val[prop];

                  if (typeof app[prop] !== 'function') {
                    app.create(prop);
                  }

                  if (typeof value === 'string') {
                    if (utils.hasGlob(value)) {
                      var files = utils.glob.sync(value, {cwd: app.cwd});
                      if (files.length) {
                        files.forEach(function() {
                          app[prop].addView(fp, {
                            content: fs.readFileSync(fp)
                          });
                        });
                      }
                    } else {
                      var obj = tryRequire(path.resolve(value));
                      if (obj) app[prop].addViews(obj);
                    }
                  }
                }
              }
            }
          }
        });
    });
  };
};

function normalize(val, key, options, schema) {
  if (!utils.hasValue(val)) return;
  if (normalized[key]) return normalized[key];
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
  normalized[key] = res;
  return res;
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

        var o = tryRequire(path.resolve(val));
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
        var fn = tryRequire(modulename);
        var fp;

        if (!fn) {
          fp = path.resolve(app.cwd, 'node_modules', modulename);
          fn = tryRequire(fp);
          if (fn) opts.path = fp;
        }

        if (typeof fn === 'undefined') {
          handleError(app, modulename, key);
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

function handleError(app, name, prop) {
  var appname = app._name.toLowerCase() + '.' + prop;
  console.error('cannot resolve: `%s`, in package.json `%s` config', name, appname);
}

function handleModuleError(app, type, name) {
  var msg = 'cannot find '
    + app._name.toLowerCase() + ' ' + type + ' module "'
    + name + '" in local node_modules.'
  throw new Error(msg);
}

function tryRequire(name) {
  try {
    return require(name);
  } catch (err) {}

  try {
    return require(path.resolve(name));
  } catch (err) {}
}
