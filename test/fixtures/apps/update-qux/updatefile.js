'use strict';

module.exports = function (app) {
  app.task('default', function() {
    return app.src('package.json')
      .pipe(app.dest('actual/qux'));
  });
  app.task('a', function() {
    console.log('updater qux > a!');
    return app.src('*.js')
      .pipe(app.dest('actual/qux/a'))
  });
  app.task('b', function() {
    console.log('updater qux > b!');
    return app.src('*.js')
      .pipe(app.dest('actual/qux/b'))
  });
  app.task('c', function() {
    console.log('updater qux > c!');
    return app.src('*.js')
      .pipe(app.dest('actual/qux/c'))
  });
};
