'use strict';

// require('time-require');
var argv = require('minimist')(process.argv.slice(2));
var Generate = require('./generate');
var create = require('../');

var Runner = create(Generate, {
  parent: 'generate',
  single: 'generator',
  plural: 'generators',
  rename: function (name) {
    return name.replace(/^generate-/, '');
  }
});

var runner = new Runner(argv);
// console.time('runner');
// runner.resolve(['generate-*/generate.js'], {
//   cwd: 'examples/apps'
// });
// console.timeEnd('runner');
// runner.on('register', function() {
//   // console.log(arguments)
// });

// runner.on('resolve', function(filepath) {

// });

runner.resolve('generate-*/generate.js', {
  cwd: 'examples/apps'
});

// runner.register('generate.js', 'generate-*', {
//   cwd: 'examples/apps'
// });

runner.register('generate-aaa', function (app, base, env) {
  // console.log(arguments)
});

runner.register('generate-bbb', function (app, base, env) {
  // console.log(arguments)
});

runner.register('ccc', function (app, base, env) {
  console.log(base.generators)
});


// console.log(runner.generators)
// console.log(runner.argv('foo'))
