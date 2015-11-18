'use strict';

var get = require('get-value');
var set = require('set-value');
var define = require('define-property');
var Base = require('assemble-core');
var utils = require('../lib/utils');

function env() {
  return function(app) {
    app.env = {};
    app.env.cwd = process.cwd();
  }
}

function Generate(options, parent, fn) {
  if (typeof options === 'function') {
    return new Generate(null, null, options);
  }

  if (typeof parent === 'function') {
    return new Generate(options, null, parent);
  }

  if (!(this instanceof Generate)) {
    return new Generate(options, parent, fn);
  }

  this.isGenerate = true;
  this.isGenerator = false;
  this.define('parent', {});
  this.name = 'root';
  this.depth = 0;
  this.env = {};

  Base.call(this);
  this.options = options || {};
  this.define('cache', this.cache);
  this.generators = {};

  this.on('register', function(name, generator) {
    console.log(generator.name);
  });

  if (parent) {
    this.parent = parent;
    this.depth = this.parent.depth + 1;
    this.env = this.parent.env;
  } else {
    this.use(env());
  }

  if (typeof fn === 'function') {
    this.isGenerator = true;
    fn.call(this, this, this.base, this.env);
  }
}

/**
 * Inherit Base
 */

Base.extend(Generate);

define(Generate.prototype, 'depth', {
  get: function() {
    return this.parent.depth ? this.parent.depth + 1 : 1;
  }
});

define(Generate.prototype, 'base', {
  get: function() {
    return this.parent.base || this;
  }
});


Generate.prototype.register = function(name, options, fn) {
  // return (this.generators[name] = new Generate(options, this, fn));
  var generator = new Generate(options, this, fn);
  generator.name = name;
  this.generators[name] = generator;
  this.emit('register', name, generator);
  return generator;
};

Generate.prototype.generator = function(name, options, fn) {
  if (arguments.length === 1 && typeof name === 'string') {
    name = name.split('.').join('.generators.');
    return get(this.generators, name);
  }
  return this.register.apply(this, arguments);
};


var generate = new Generate();

generate.register('one', {}, function(app, base, env) {
  app.register('a', {}, function(a, base_a, env2) {
    a.register('aa', {}, function(aa, base_aa, env3) {
      aa.register('aaa', {}, function(aaa, base_aaa) {
      });
    });
  });
        console.log(app)
  app.register('b', {}, function() {
        // console.log(app)

  });
  app.register('c', {}, function() {

  });
});

generate.register('two', {}, function(app, base, env) {
  // console.log(base.generators.one)
});


// console.log(generate.generator('one.a.aa.aaa'))
// console.log(generate)
