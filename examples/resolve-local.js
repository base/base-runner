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

app.resolve('examples/apps/*/generate.js', {
  resolveLocal: true
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

app.build(['foo', 'two'], function(err) {
  if (err) return console.log(err);
  console.log('build > two: done!');
});
