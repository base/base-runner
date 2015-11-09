'use strict';

var utils = require('../lib/utils');

/**
 * This is a `runner` plugin
 */

module.exports = function(options) {
  options = options || {};
  var plural = options.plural;

  return function(app) {

    app.define('list', function(cb) {
      var questions = utils.questions(this.base.options);
      var choices = utils.list(this.base[plural]);
      if (!choices.length) {
        console.log(utils.cyan(' No generator tasks found.'));
        return cb(null, {
          runners: {}
        });
      }

      var question = {
        runners: {
          message: 'pick an generator to run',
          type: 'checkbox',
          choices: choices
        }
      };

      questions.ask(question, function(err, answers) {
        if (err) return cb(err);
        var args = {
          runners: {}
        };
        answers[plural].forEach(function(answer) {
          var segs = answer.split(':');
          if (segs.length === 1) return;
          utils.union(args[plural], segs[0], (segs[1] || 'default').split(','));
        });
        return cb(null, args);
      });
    });

  };
};
