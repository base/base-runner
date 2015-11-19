'use strict';

require('mocha');
var assert = require('assert');
var utils = require('../lib/utils');
var toTasks = require('../lib/to-tasks');

describe('utils', function() {
  describe('to-tasks', function() {
    it('should return an array', function() {
      var generators = toTasks();
      assert(generators);
      assert(Array.isArray(generators));
    });

    it('should return an array of objects', function() {
      var generators = toTasks('foo');
      assert(generators);
      assert.equal(typeof generators[0], 'object');
    });

    it('should add "simple" tasks to the `base` array', function() {
      var generators = toTasks('foo');
      assert(generators[0].hasOwnProperty('base'));
      assert(Array.isArray(generators[0].base));
      assert.equal(generators[0].base[0], 'foo');
    });

    it('should return `base` property with an array of tasks', function() {
      var generators = toTasks('foo');
      assert(generators);
      assert(Array.isArray(generators[0].base));
      assert.equal(generators[0].base.length, 1);
    });

    it('should put consecutive `base` tasks in the same array', function() {
      var generators = toTasks(['foo', 'bar']);
      assert(generators);
      assert(Array.isArray(generators[0].base));
      assert.equal(generators[0].base.length, 2);
    });

    it('...', function() {
      assert.deepEqual(toTasks('foo|a.b:c,d,e|one.two:zzz|a.aa.aaa:ax'), [
        {'base': ['foo']}, 
        {'a.b': ['c', 'd', 'e']}, 
        {'one.two': ['zzz']}, 
        {'a.aa.aaa': ['ax']}
      ]);

      assert.deepEqual(toTasks('foo,bar|a.b:c,d,e|one.two:zzz|a.aa.aaa:ax'), [
        {'base': ['foo', 'bar']}, 
        {'a.b': ['c', 'd', 'e']}, 
        {'one.two': ['zzz']}, 
        {'a.aa.aaa': ['ax']}
      ]);

      assert.deepEqual(toTasks('foo,bar|a.b:c|baz'), [
        {'base': ['foo', 'bar']}, 
        {'a.b': ['c']},
        {'base': ['baz']}
      ]);

      assert.deepEqual(toTasks('foo,bar|a.b:c|baz,qux'), [
        {'base': ['foo', 'bar']}, 
        {'a.b': ['c']},
        {'base': ['baz', 'qux']}
      ]);

      assert.deepEqual(toTasks(['foo,bar', 'baz,qux']), [
        {'base': ['foo', 'bar', 'baz', 'qux']}, 
      ]);

      assert.deepEqual(toTasks('foo|a.b:c|a.b:d|baz'), [
        {'base': ['foo']}, 
        {'a.b': ['c', 'd']},
        {'base': ['baz']}
      ]);

      assert.deepEqual(toTasks('base:foo|a.b:c|a.b:d|baz'), [
        {'base': ['foo']}, 
        {'a.b': ['c', 'd']},
        {'base': ['baz']}
      ]);

      assert.deepEqual(toTasks(['one', 'two']), [
        {'base': ['one', 'two']} 
      ]);
    });
  });
});
