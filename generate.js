'use strict';

var path = require('path');

module.exports = function (app, base, env) {
  app.task('a', function() {
    return app.src('package.json')
      .pipe(app.dest('actual/foo'));
  });
  app.task('default', function() {
    return app.src('package.json')
      .pipe(app.dest('actual/foo'));
  });
};
