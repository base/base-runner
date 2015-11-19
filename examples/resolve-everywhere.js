'use strict';

var Generate = require('generate');
var generator = Generate.generator;
var create = require('..');

var Runner = create(Generate, {
  parent: 'Generate',
  child: 'Generator',
  appname: 'generate',
  method: 'generator',
  plural: 'generators',
  configfile: 'generate.js',
  initFn: function () {
    this.isGenerate = true;
    this.isGenerator = false;
  },
  inspectFn: function (obj) {
    obj.isGenerate = this.isGenerate;
    obj.isGenerator = this.isGenerator;
    obj.generators = this.generators;
  },
});

var app = new Runner();
app.on('error', function(err) {
  console.log(err);
});

app.resolve(['generate-*/generate.js'], {
  resolveGlobal: true,
  paths: ['examples/apps'],
  filter: function(fp) {
    if (/_generate\/generate\-bar/.test(fp)) {
      return false;
    }
    return true;
  }
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

app.register('two', function(two, base, env) {
  two.task('x', function(cb) {
    console.log('task:x');
    cb();
  });
  two.task('y', function(cb) {
    console.log('task:y');
    cb();
  });
});


app.build('two', function(err) {
  if (err) return console.log(err);
  console.log('build > two: done!');
});
