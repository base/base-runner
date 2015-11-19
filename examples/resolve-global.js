'use strict';

var Assemble = require('assemble-core');
var resolver = require('base-resolver');
var create = require('..');

function Base() {
  Assemble.call(this, options, parent, fn);
}


var Runner = create(Assemble, {
  parent: 'Assemble',
  child: 'Generator',
  appname: 'generate',
  method: 'generator',
  plural: 'generators',
  configfile: 'generate.js'
});

var app = new Runner();
app.use(resolver(Assemble, {
  method: 'generator'
}));

app.on('error', function(err) {
  console.log(err);
});

app.resolve(['generate-*/generate.js'], {
  resolveGlobal: true,
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
