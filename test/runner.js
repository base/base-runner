'use strict';

require('mocha');
var assert = require('assert');
var Base = require('base-methods');
var create = require('..');
var Runner;
var runner;

describe('create', function() {
  it('should export a function', function() {
    assert(typeof create === 'function');
  });

  it('should throw an error when options object is missing', function(cb) {
    try {
      create(Base);
      cb(new Error('expected an error'));
    } catch(err) {
      assert(err);
      assert.equal(err.message, 'base-runner expected an options object');
      cb();
    }
  });

  it('should throw an error when method name is missing', function(cb) {
    try {
      create(Base);
      cb(new Error('expected an error'));
    } catch(err) {
      assert(err);
      assert.equal(err.message, 'expected "method", "single", or "plural" name');
      cb();
    }
  });

  it.only('should use Base when no constructor is passed', function(cb) {
    var Runner = create({
      method: 'foo'
    });
    var runner = new Runner();
    assert(runner instanceof Base);
  });
});

describe('runner', function() {
  beforeEach(function() {
    Runner = create(Base, {

    });
  });

  describe('constructor', function() {
    it('should create an instance of Runner:', function() {
      runner = new Runner();
      assert(runner instanceof Runner);
    });

    it('should new up without new:', function() {
      runner = Runner();
      assert(runner instanceof Runner);
    });
  });

  describe('static methods', function() {
    it('should expose `extend`:', function() {
      assert(typeof Runner.extend ==='function');
    });
  });

  describe('prototype methods', function() {
    beforeEach(function() {
      runner = new Runner();
    });

    it('should expose `set`', function() {
      assert(typeof runner.set ==='function');
    });
    it('should expose `get`', function() {
      assert(typeof runner.get ==='function');
    });
    it('should expose `visit`', function() {
      assert(typeof runner.visit ==='function');
    });
    it('should expose `define`', function() {
      assert(typeof runner.define ==='function');
    });
    it('should expose `views`', function() {
      assert(typeof runner.views === 'object');
    });
  });

  describe('instance', function() {
    beforeEach(function() {
      runner = new Runner();
    });

    it('should set a value on the instance:', function() {
      runner.set('a', 'b');
      assert(runner.a ==='b');
    });

    it('should get a value from the instance:', function() {
      runner.set('a', 'b');
      assert(runner.get('a') ==='b');
    });
  });

  describe('initialization', function() {
    it('should listen for errors:', function(done) {
      runner = new Runner();
      runner.on('error', function(err) {
        assert(err.message === 'foo');
        done();
      });
      runner.emit('error', new Error('foo'));
    });

    it('should mixin methods after init:', function() {
      runner = new Runner();
      runner.option({
        mixins: {
          foo: function() {}
        }
      });
      assert(typeof runner.foo ==='function');
    });

    it('should expose constructors from `lib`:', function() {
      runner = new Runner();
      runner.expose('Collection');
      assert(typeof runner.Collection ==='function');
    });

    it('should update constructors after init:', function() {
      var Group = Runner.Group;
      function MyGroup() {
        Base.call(this);
      }
      Base.extend(MyGroup);

      runner = new Runner();
      assert.equal(runner.Group, Group);
      assert.equal(runner.get('Group'), Group);
      runner.option('Group', MyGroup);
      assert.equal(runner.Group, MyGroup);
      assert.equal(runner.get('Group'), MyGroup);
    });

    it('should mixin prototype methods defined on options:', function() {
      runner = new Runner({
        mixins: {
          foo: function() {}
        }
      });
      assert(typeof runner.foo ==='function');
      delete Runner.prototype.foo;
    });

    it('should expose `_` on runner:', function() {
      runner = new Runner();
      assert(typeof runner._ ==='object');
    });

    it('should not re-add `_` in init:', function() {
      runner = new Runner();
      runner._.foo = 'bar';
      runner.defaultConfig();
      assert(runner._.foo ==='bar');
    });
  });
});
