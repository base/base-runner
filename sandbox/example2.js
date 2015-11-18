'use strict';

var Generate = require('./generator');
var ask = require('assemble-ask');

var generate = new Generate()

generate.on('error', function(err) {
  console.log(err);
});

generate.task('foo', function (cb) {
  console.log('this is task foo!');
  cb();
});

generate.task('bar', function (cb) {
  console.log('this is task bar!');
  cb();
});

generate.task('baz', ['bar'], function (cb) {
  console.log('this is task baz!');
  cb();
});

generate.register('one', function(one, base, env) {
  one.task('x', function(cb) {
    console.log('this is "one:x"')
    cb();
  });

  one.task('y', function() {});

  one.register('a', function(a, abase, env2) {
    a.task('ax', function(cb) {
      console.log('this is "one.a:ax"')
      cb();
    });
    a.task('ay', function() {});

    a.register('aa', function(aa, base3, env3) {
      aa.register('aaa', function(aaa) {
        aaa.task('foo', function(cb) {
          console.log('deep foo!');
          cb();
        });
      });
    });
  });

  one.register('b', function() {});
  one.register('c', function() {});
  one.register('d', function() {});
});

// generate.register('two', function(two, base, env) {
//   two.task('x', function() {});
//   two.task('y', function() {});
// });

// generate.resolve(['generate-*/generate.js'], {
//   paths: ['examples/apps']
// });

// generate.build('foo', function() {

// })

// generate.build('base.foo|one.a:ax', function(err) {
//   if (err) return console.log(err);
//   console.log('done!');
//   console.log();
// });

generate.build(['base:foo|one.a:ax', 'foo', 'baz'], function(err) {
  if (err) return console.log(err)
  console.log('done!');
  console.log();
});

generate.build(['foo', 'baz'], function(err) {
  if (err) return console.log(err)
  console.log('done!');
  console.log();
});

generate.build('one.a:ax', function(err) {
  if (err) return console.log(err)
  console.log('done!');
  console.log();
});

var arr = [
  {base: ['foo']},
  {base: ['foo']},
  {base: ['foo']},
  {base: ['foo']},
];

// generate.build(arr, function(err) {
//   if (err) return console.log(err)
//   console.log('done!');
//   console.log();
// });


generate.build('one.a.aa.aaa:foo', function(err) {
  if (err) return console.log(err)
  console.log('done!');
  console.log();
});


// console.log(generate)
// console.log(generate.generator('one'))
// console.log(generate.generator('one.a'))

