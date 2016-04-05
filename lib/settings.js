'use strict';

var debug = require('debug')('base:runner:settings');
var settings = require('./settings/');
// var schema = require('./schema');
var utils = require('./utils');

/**
 * Create
 */

module.exports = function(config) {
  return function(app) {
    if (this.isRegistered('base-runner-settings')) return;
    // this.use(schema(config));

    /**
     * Adds a `.settings` method to `app`
     *
     * @param {Object} `options`
     * @return {Object}
     */

    this.define('settings', function(options) {
      debug('loading schema onto merge-settings');
      var opts = utils.extend({}, config, this.options, options);
      return new utils.Settings(this.config.schema);
    });

    /**
     * Load the user's configuration settings from the following:
     *
     * - `app.store.data`: globally stored config values
     * - `localConfig`: local config file, `.json` or `.yml`
     * - `options`: instance options, defined via API
     * - `config`: package.json config object
     * - `argv`: `process.argv` processed by [minimist] and [expand-args].
     *
     * @param {Object} `options`
     * @return {Object}
     */

    this.define('loadSettings', function(argv, options) {
      debug('loading settings');
      var opts = utils.merge({}, config, this.options, options);
      return this.settings(opts)
        .set('store', settings.store(this))
        .set('runner', opts)
        .set('pkg', settings.pkg(this, app._name))
        .set('local', settings.localConfig(this, app._name))
        .set('argv', argv);
    });
  };
};
