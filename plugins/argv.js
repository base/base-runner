'use strict';

var get = require('get-value');
var commands = require('expand-commands');
var expand = require('expand-args');
var utils = require('../lib/utils');

/**
 * This is a `runner` plugin
 */

module.exports = function(config) {
  var opts = createOptions(config);
  var plural = opts.plural;

  return function(app) {
    var argv = app._argv;
    // var ctx = utils.expandArgv(expand(argv), opts);
    // var ctx = expandArgv(expand(argv), opts);

    app.define('argv', function(argv, commands, fn) {
      var args = {};
      args.argv = argv;
      args.commands = [];
      args.updaters = {};

      args.flags = utils.expandArgs(utils.omit(argv, ['_', 'files']));
      args.flagskeys = Object.keys(args.flags);

      var files = argv.files ? utils.pick(argv, 'files') : null;
      if (files) args.flags.files = files;

      var arr = argv._ || [];
      var len = arr.length, i = -1;

      while (++i < len) {
        var key = arr[i];

        if (/\W/.test(key)) {
          var obj = utils.expand(key);

          for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
              var val = obj[key];
              utils.union(args, 'generators.' + key, val);
            }
          }
          continue;
        }

        if (utils.contains(commands, key)) {
          args.commands.push(key);
          continue;
        }
        fn(key, args);
      }
      return args;
    });

    // app.define('argv', function(prop) {
    //   return get(ctx, prop);
    // });

    // function expandArgv(argv, options) {
    //   var opts = utils.extend({commands: []}, app.options, options);

    //   return commands(argv, opts, function(key, args) {
    //     var apps = app.base[plural];
    //     if (key in apps) {
    //       utils.union(args, [plural, key], 'default');
    //     } else if (key !== 'base') {
    //       utils.union(args, [plural, 'base'], key);
    //     }
    //     return args;
    //   });
    // }
  };
};

function createOptions(options) {
  var opts = utils.extend({}, options);
  if (typeof opts.plural === 'undefined') {
    throw new TypeError('expected options.plural to be a string.');
  }
  return opts;
}
