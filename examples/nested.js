'use strict';

// require('time-require');

var argv = require('minimist')(process.argv.slice(2));
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

/**
 * Resolve generators and their tasks
 */

app.resolve('examples/apps/*/generate.js', {
  resolveLocal: true
});

/**
 * Tasks
 */

app.task('foo', function (cb) {
  console.log('this is task foo!');
  cb();
});

app.task('bar', ['foo'], function (cb) {
  console.log('this is task bar!');
  cb();
});

app.task('baz', ['bar'], function (cb) {
  console.log('this is task baz!');
  cb();
});

/**
 * Nested generators and tasks
 */

app.register('one', function(one, base, env) {
  one.task('x', function(cb) {
    console.log('task:x');
    cb();
  });
  one.task('y', function(cb) {
    console.log('task:y');
    cb();
  });

  one.register('two', function(two, base, env) {
    two.task('x', function(cb) {
      console.log('task:x');
      cb();
    });
    two.task('y', function(cb) {
      console.log('task:y');
        console.log(base)
      cb();
    });
  });
});


app.build(['baz', 'one.two:x'], function(err) {
  if (err) return console.log(err);
  console.log('build > one: done!');
});
