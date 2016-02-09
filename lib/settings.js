'use strict';

var debug = require('debug')('base:runner:settings');
var sources = require('./sources/');
var schema = require('./schema');
var utils = require('./utils');

/**
 * Create
 */

module.exports = function(config) {
  return function() {
    if (this.isRegistered('base-runner-settings')) return;
    this.use(schema(config));

    /**
     * Adds a `.settings` method to `app`
     *
     * @param {Object} `options`
     * @return {Object}
     */

    this.define('settings', function(options) {
      var opts = utils.extend({}, config, this.options, options);
      return new utils.Settings(this.schema(opts));
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
      var opts = utils.extend({}, config, this.options, options);
      var name = !(this.base && this.base.name)
        ? this.constructor.name.toLowerCase()
        : this.base.name;

      return this.settings(opts)
        .set('runner', opts)
        .set('store', sources.store(this))
        .set('local', sources.localConfig(this, name))
        .set('opts', sources.opts(this))
        .set('pkg', sources.pkg(this, name))
        .set('argv', argv)
    });
  };
};
