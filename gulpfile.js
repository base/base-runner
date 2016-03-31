'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var eslint = require('gulp-eslint');
var unused = require('gulp-unused');
var through = require('through2');

var lib = ['*.js', 'lib/**/*.js'];

gulp.task('coverage', function() {
  return gulp.src(lib)
    .pipe(istanbul({includeUntested: true}))
    .pipe(istanbul.hookRequire());
});

gulp.task('mocha', ['coverage'], function() {
  return gulp.src('test/*.js')
    .pipe(mocha({reporter: 'spec'}))
    .pipe(istanbul.writeReports());
});

gulp.task('eslint', function() {
  return gulp.src(['bin/*.js', 'test/*.js'].concat(lib))
    .pipe(eslint())
});

gulp.task('unused', function() {
  var plugins = require('./lib/plugins');
  var utils = require('./lib/utils');
  var keys = Object.keys(utils).concat(Object.keys(plugins));
  return gulp.src(['index.js', 'lib/**/*.js'])
    .pipe(unused({keys: keys}))
});

gulp.task('default', ['mocha', 'eslint']);
