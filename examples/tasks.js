'use strict';

var Generate = require('generate');
var generator = Generate.generator;
var create = require('..');

var Runner = create(Generate, {
  method: 'generator'
});

var app = new Runner();
app.on('error', function(err) {
  console.log(err);
});

app.task('foo', function (cb) {
  console.log('this is task foo!');
  cb();
});

app.task('bar', function (cb) {
  console.log('this is task bar!');
  cb();
});

app.task('baz', ['bar'], function (cb) {
  console.log('this is task baz!');
  cb();
});

app.build(['foo', 'baz'], function(err) {
  if (err) return console.log(err);
  console.log('build foo, baz => done!');
});
