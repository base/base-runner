'use strict';

console.time('runner');
var Generate = require('generate');
var create = require('..');

var Runner = create(Generate, {
  parent: 'generate',
  single: 'generator',
  method: 'generator',
  plural: 'generators'
});

var runner = new Runner();

// global generator
runner.register(['generate-*/generate.js'], {cwd: '@/'});
// local generator
runner.register('generate-aaa', function (app, base, env) {
  app.task('default', function(cb) {
    console.log('generator-aaa > default task');
    cb();
  });
});

// build
runner.build('aaa', function(err) {
  if (err) return console.log(err);
  console.log('done!');
});

console.timeEnd('runner');
