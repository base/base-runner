'use strict';

module.exports = function (app) {
  app.task('default', function() {
    return app.src('package.json')
      .pipe(app.dest('actual/baz'));
  });
  app.task('a', function() {
    console.log('baz > a!');
    return app.src('*.js')
      .pipe(app.dest('actual/baz/a'))
  });
  app.task('b', function() {
    console.log('baz > b!');
    return app.src('*.js')
      .pipe(app.dest('actual/baz/b'))
  });
  app.task('c', function() {
    console.log('baz > c!');
    return app.src('*.js')
      .pipe(app.dest('actual/baz/c'))
  });
};
