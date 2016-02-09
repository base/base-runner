'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var eslint = require('gulp-eslint');
var through = require('through2');

var lint = ['index.js', 'utils.js', 'test.js'];

gulp.task('coverage', function() {
  return gulp.src(lint)
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task('mocha', ['coverage'], function() {
  return gulp.src('test.js')
    .pipe(mocha({reporter: 'spec'}))
    .pipe(istanbul.writeReports());
});

gulp.task('eslint', function() {
  return gulp.src(lint)
    .pipe(eslint())
});

gulp.task('vars', function() {
  var plugins = require('./lib/plugins');
  var utils = require('./lib/utils');
  var keys = Object.keys(utils).concat(Object.keys(plugins));
  var report = {};
  var cache = {};

  return gulp.src(['index.js', 'lib/**/*.js'])
    .pipe(through.obj(function(file, enc, next) {
      var str = file.contents.toString();
      keys.forEach(function(key) {
        report[key] = report[key] || 0;
        var re = cache[key] || (cache[key] = new RegExp('\\.' + key, 'g'));
        var m = str.match(re);
        if (!m) return;
        report[key]++;
      });

      next(null, file);
    }, function(next) {
      var keys = Object.keys(report);
      var res = {};

      keys.sort(function(a, b) {
        return report[a] > report[b] ? -1 : 1;
      });

      keys.forEach(function(key) {
        res[key] = report[key];
      });

      console.log(res);
      console.log(keys.length + 1, 'modules');
      next();
    }))
});

gulp.task('default', ['mocha', 'eslint']);
