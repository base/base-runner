'use strict';

var Base = require('assemble-core');
var config = require('base-config');
var generator = require('./lib/generator');
var utils = require('./lib/utils');

function Generate() {
  Base.apply(this, arguments);
  this.isGenerate = true;
  this.isGenerator = false;
}
Base.extend(Generate);

var create = require('./');
var Runner = create(Generate, generator, {
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

app.resolve(['generate-*/generate.js'], {
  resolveGlobal: true,
  // paths: ['examples/apps'],
  filter: function(fp) {
    if (/_generate\/generate\-bar/.test(fp)) {
      return false;
    }
    return true;
  }
});

app.resolve('examples/apps/*/generate.js', {
  resolveLocal: true
});

app.resolve('generate.js', {
  resolveLocal: true
});

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

app.register('one', function(one, base, env) {
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
          console.log(base3)
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

// app.resolve(['app-*/app.js'], {
//   paths: ['examples/apps']
// });

app.build('two', function(err) {
  if (err) return console.log(err);
  console.log('build > two: done!');
});

// app.build('base.foo|one.a:ax', function(err) {
//   if (err) return console.log(err);
//   console.log('done!');
//   console.log();
// });

// app.build(['base:foo,baz|one.a:ax', 'foo', 'baz'], function(err) {
//   if (err) return console.log(err)
//   console.log('done!');
//   console.log();
// });

// app.build(['base:foo,baz', 'foo', 'baz'], function(err) {
//   if (err) return console.log(err)
//   console.log('done!');
//   console.log();
// });

// app.build(['foo', 'baz'], function(err) {
//   if (err) return console.log(err)
//   console.log('done!');
//   console.log();
// });

// app.build('one:x', function(err) {
//   if (err) return console.log(err)
//   console.log('done!');
//   console.log();
// });

/**
 * Nested
 */

// app.build('one.a:ax', function(err) {
//   if (err) return console.log(err)
//   console.log('done!');
//   console.log();
// });

// var arr = [
//   {base: ['foo', 'baz']},
//   // {base: ['foo']},
//   // {base: ['foo']},
// ];

// app.build(arr, function(err) {
//   if (err) return console.log(err)
//   console.log('done!');
//   console.log();
// });

// console.log(app)

// app.build('one.a.aa.aaa:foo', function(err) {
//   if (err) return console.log(err)
//   console.log('done!');
//   console.log();
// });


// app.build('one:x', function(err) {
//   if (err) return console.log(err)
//   console.log('done!');
//   console.log();
// });


// console.log(app)
// console.log(app.generator('one'))
// console.log(app.generator('one.a.aa.aaa'))

