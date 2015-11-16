'use strict';

var Assemble = require('assemble-core');
var Runner = require('./');
var runner = new Runner();

runner.registerUp('generate-*/generate.js', {
  paths: ['examples/apps'],
  realpath: true,
  Base: Assemble,
  cwd: '',
  filter: function(fp) {
    return true;
  }
});

// runner.base.task('a', function() {
//   console.log('woohoo!')
// })

// runner.build('qux:a', function(err) {
//   if (err) return console.log(err);
//   console.log('done!');
// });

// runner.build('foo:q', function(err) {
//   if (err) return console.log(err);
//   console.log('done!');
// });

var generators = {
  foo: ['a', 'b'],
  bar: ['b']
};

// runner.on('run', function(name) {
//   console.log('running');
// });

// runner.runTasks(generators, function(err) {
//   if (err) return console.log(err);
//   console.log('done!');
// });
runner.base
  .generator('foo')
  .build('a', function(err) {
    if (err) return console.log(err);
  });

