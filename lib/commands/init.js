'use strict';

/**
 * Force initialization questions to be (re-)asked. The resulting answer data is
 * persisted to disk and cached on `app.cache.data`.
 *
 * - Use `app.data('answers')` to get answer data.
 * - Open the directory where data is persisted by entering `--open answers` in the command line
 * ```sh
 * # ask all questions
 * $ --init
 * # ask all `author.*` questions
 * $ --init "author.*"
 * # ask all `*.name` questions (like `project.name` and `author.name`)
 * $ --init "*.name*"
 * ```
 * @name init
 * @api public
 * @cli public
 */

module.exports = function(app) {
  var force = require('question-force');
  var Questions = require('question-store');
  var questions = new Questions();

  return function(val, next) {
    questions.use(force());
    questions.setData(require('../../package'))
      .set('author.name', 'Author name?')
      .set('author.username', 'Author username?')
      .set('author.url', 'Author url?')

      .set('project.name', 'What is the project name?')
      .set('project.desc', 'What is the project description?');

    var pattern = /^project/;

    if (typeof val === 'string') {
      pattern = val;
    }

    questions.force(pattern)
      .ask(function(err, answers) {
        if (err) return cb(err);

        app.data({answers: answers});
        next();
      });

  };
};
