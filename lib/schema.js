'use strict';

var debug = require('debug')('base:runner:schema');
var expanders = require('./expanders');
var defaults = require('./defaults');
var utils = require('./utils');

module.exports = function(config) {
  return function(app) {
    if (this.isRegistered('base-schema')) return;

    this.define('schema', function(options) {
      debug('initializing base-schema');

      config = utils.extend({}, defaults.schema, config);
      var opts = utils.extend({app: this}, config, this.options, options);

      return new utils.Schema(opts)
        // Configuration, settings and data
        .field('options', 'object')
        .field('config', ['object', 'boolean'], {
          normalize: expanders.config(app)
        })
        .field('data', ['object', 'boolean'], {
          normalize: expanders.data(app)
        })

        // modules
        .field('helpers', ['array', 'object', 'string'], {
          normalize: expanders.helpers(app)
        })
        .field('asyncHelpers', ['array', 'object', 'string'], {
          normalize: expanders.helpers(app)
        })
        .field('engines', ['array', 'object', 'string'], {
          normalize: expanders.normalize(app)
        })
        .field('plugins', ['array', 'object', 'string'], {
          normalize: expanders.plugins(app)
        })

        // template related
        .field('create', 'object', {
          normalize: expanders.create(app)
        })
        .field('layout', ['object', 'string', 'boolean', 'null'], {
          normalize: function(val, key, config, schema) {
            if (typeof val === 'string') {
              return val;
            }
            return val;
          }
        })
        .field('templates', ['array', 'object'], {
          normalize: expanders.templates(app)
        })
        .field('views', ['array', 'object'], {
          normalize: expanders.templates(app)
        });
    });
  };
};
