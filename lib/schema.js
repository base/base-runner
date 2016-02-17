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
        .field('data', ['object', 'boolean'], {
          normalize: expanders.data(app)
        })
        .field('helpers', ['array', 'object', 'string'], {
          normalize: expanders.normalize(app)
        })
        .field('asyncHelpers', ['array', 'object', 'string'], {
          normalize: expanders.normalize(app)
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
        .field('layout', ['object', 'string', 'boolean', 'null'])
        .field('templates', ['array', 'object'], {
          normalize: expanders.templates(app)
        });
    });
  };
};
