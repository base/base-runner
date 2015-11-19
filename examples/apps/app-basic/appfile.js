'use strict';

module.exports = function (app) {
  app.task('default', function() {
    return app.src('package.json')
      .pipe(app.dest('actual/bar'));
  });
};
