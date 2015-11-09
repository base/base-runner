'use strict';

var argv = require('minimist')(process.argv.slice(2));
var Generate = require('./app');
var create = require('../');

var Runner = create(Generate, {
  single: 'generator',
  plural: 'generators',
  rename: function (name) {
    return name.replace(/^generator-/, '');
  }
});


var runner = new Runner(argv, {});

runner.register('generate-foo', function (app, base, env) {
  // console.log(arguments)
});

runner.register('generate-bar', function (app, base, env) {
  // console.log(arguments)
});

runner.register('baz', function (app, base, env) {
  console.log(base.generators)
});
