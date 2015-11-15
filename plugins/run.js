'use strict';

var utils = require('../lib/utils');

/**
 * This is a `runner` plugin
 */

module.exports = function(options) {
  options = options || {};
  var plural = options.plural;
  var single = options.single;

  return function(runner) {

    runner.define('run', function(args, cb) {
      if (typeof args === 'function') {
        cb = args;
        args = null;
      }

      var args = {
        commands: [],
        flags: ['set', 'get']
      }

      args[plural] = {};

      // if (!args) {
      //   var commands = this.options.commands || this.commands;
      //   args = this.expandArgv(this._argv, commands, this.base[plural]);
      // }

      if (args.commands && args.commands.length > 1) {
        var cmd = '"' + args.commands.join(', ') + '"';
        return cb(new Error('Error: only one root level command may be given: ' + cmd));
      }
      // var flags = this.argv.get('flags');

      this.base.cli.process(args.flags);
      var runners = Object.keys(args[plural]);

      utils.async.eachSeries(runners, function(name, next) {
        var tasks = args[plural][name];
        var app = name !== 'base' ? this.base[single](name) : this.base;

        this.emit('task', name, tasks);
        app.build(tasks, function(err) {
          if (err) return next(err);
          next();
        });
      }.bind(this), cb);
      return this;
    });
  };
};
