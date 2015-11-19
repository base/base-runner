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

  it('should use Base when no constructor is passed', function() {
    var Runner = create({}, {}, {
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
  });

  describe('instance methods', function() {
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
    it('should listen for errors:', function(cb) {
      runner = new Runner();
      runner.on('error', function(err) {
        assert(err.message === 'foo');
        cb();
      });
      runner.emit('error', new Error('foo'));
    });
  });
});