'use strict';

var commands = require('./commands');
var utils = require('./utils');

/**
 * Custom mappings to extend the built-in mappings
 * provided by the `base-cli` plugin.
 */

module.exports = function(options) {
  return function(app) {
    app.use(utils.cli());

    for (var key in commands) {
      if (commands.hasOwnProperty(key)) {
        app.cli.map(key, commands[key](app));
      }
    }

    app.cli
      .map('config', function(val, next) {
        console.log(arguments)
        next();
      })
      .map('tasks', function(tasks, next) {
        app.generateEach(tasks, next);
      })
      // .map('ask', commands.ask(app))
      // .map('cwd', commands.cwd(app))
      // .map('data', commands.data(app))
      // .map('diff', commands.diff(app))
      // .map('help', commands.help(app))
      // .map('init', commands.init(app))
      // .map('open', commands.open(app))
      // .map('options', commands.option(app))
      // .map('option', commands.option(app))
      // .map('show', commands.show(app))

  };
};
