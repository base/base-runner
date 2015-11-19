'use strict';

var path = require('path');

module.exports = function (app, base, env) {
  // var fp = path.resolve(__dirname, '../update-qux/updatefile.js');
  // base.register(fp);

  app.task('default', function() {
    return app.src('package.json')
      .pipe(app.dest('actual/foo'));
  });
  app.task('a', function() {
    console.log('foo > a!');
    return app.src('*.js')
      .pipe(app.dest('actual/foo/a'))
  });
  app.task('b', function() {
    console.log('foo > b!');
    return app.src('*.js')
      .pipe(app.dest('actual/foo/b'))
  });
  app.task('c', function() {
    console.log('foo > c!');
    return app.src('*.js')
      .pipe(app.dest('actual/foo/c'))
  });

  // app.task('q', function(cb) {
  //   env.build('qux:a', cb);
  // });
};
