'use strict';

var debug = require('./debug');
var defaults = require('./defaults');
var fields = require('./fields');
var utils = require('./utils');

/**
 * Define a schema for `merge-settings` to use.
 */

module.exports = function(config) {
  return function(app) {
    if (this.isRegistered('base-schema')) return;

    this.define('schema', function(options) {
      debug.schema('initializing base-schema');

      var opts = utils.merge({}, defaults.schema, config, this.options, options);
      return new utils.Schema(opts)
        // Configuration, settings and data
        .field('options', 'object')
        .field('config', ['object', 'boolean'], {
          normalize: fields.config(app, opts)
        })
        .field('data', ['object', 'boolean'], {
          normalize: fields.data(app, opts)
        })

        // modules
        .field('helpers', ['array', 'object', 'string'], {
          normalize: fields.helpers(app, opts)
        })
        .field('asyncHelpers', ['array', 'object', 'string'], {
          normalize: fields.asyncHelpers(app, opts)
        })
        .field('engines', ['array', 'object', 'string'], {
          normalize: fields.engines(app, opts)
        })
        .field('plugins', ['array', 'object', 'string'], {
          normalize: fields.plugins(app, opts)
        })

        // template related
        .field('create', 'object', {
          normalize: fields.create(app, opts)
        })
        .field('layout', ['object', 'string', 'boolean', 'null'], {
          normalize: fields.layout(app, opts)
        })
        .field('templates', ['array', 'object'], {
          normalize: fields.templates(app, opts)
        })
        .field('views', ['array', 'object'], {
          normalize: fields.templates(app, opts)
        });
    });
  };
};
