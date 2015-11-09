'use strict';

var get = require('get-value');
var minimist = require('minimist');
var expandCommands = require('expand-commands');
var expand = require('expand-args');
var utils = require('../lib/utils');

/**
 * This is a `runner` plugin
 */

module.exports = function(options) {
  var opts = createOptions(options);
  var argv = minimist(process.argv.slice(2), opts.argv);
  var plural = opts.plural;

  return function(app) {
    var ctx = expandArgv(expand(argv), opts);

    app.define('argv', function(prop) {
      return get(ctx, prop);
    });

    function expandArgv(argv, options) {
      var opts = utils.extend({commands: []}, app.options, options);
      return expandCommands(argv, opts, function(key, args) {
        var apps = app.base[plural];
        if (key in apps) {
          utils.union(args, [plural, key], 'default');

        } else if (key !== 'base') {
          utils.union(args, [plural, 'base'], key);
        }
        return args;
      });
    }

  };
};

function createOptions(options) {
  var opts = utils.extend({}, options);
  if (typeof opts.plural === 'undefined') {
    throw new TypeError('expected options.plural to be a string.');
  }
  return opts;
}
