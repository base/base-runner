'use strict';

module.exports = function (app) {
  app.task('default', function() {
    return app.src('package.json')
      .pipe(app.dest('actual/bar'));
  });
  app.task('a', function() {
    console.log('bar > a!');
    return app.src('*.js')
      .pipe(app.dest('actual/bar/a'))
  });
  app.task('b', function() {
    console.log('bar > b!');
    return app.src('*.js')
      .pipe(app.dest('actual/bar/b'))
  });
  app.task('c', function() {
    console.log('bar > c!');
    return app.src('*.js')
      .pipe(app.dest('actual/bar/c'))
  });
};
