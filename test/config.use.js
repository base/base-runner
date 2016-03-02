'use strict';

require('mocha');
var assert = require('assert');
var generators = require('base-generators');
var Base = require('base');
var base;

var runner = require('..');

describe('.config.use', function() {
  beforeEach(function() {
    base = new Base();
    base.use(generators());
    base.use(runner());
  });

  describe('field', function() {
    it('should export a function', function() {
      assert.equal(typeof runner, 'function');
    });

    it('should register as a plugin', function() {
      assert(base.registered.hasOwnProperty('base-runner'));
    });

    it('should expose a runner method', function() {
      assert.equal(typeof base.runner, 'function');
    });
  });

  describe('use', function() {
    it('should use a plugin', function(cb) {
      base.once('use', function() {
        cb();
      });

      base.config.process({use: 'test/fixtures/plugins/a'}, function(err) {
        if (err) return cb(err);
      });
    });

    it('should use a plugin from a cwd', function(cb) {
      base.once('use', function(key, val) {
        cb();
      });

      base.config.process({
        cwd: 'test/fixtures/plugins',
        use: ['a', 'b']
      }, function(err) {
        if (err) return cb(err);
      });
    });

    it('should use an array of plugins from a cwd', function(cb) {
      var arr = [];
      // test plugins emit `test`
      base.on('test', function(key) {
        arr.push(key);
      });

      base.config.process({
        cwd: 'test/fixtures/plugins',
        use: 'a,b,c'
      }, function(err) {
        if (err) return cb(err);
        assert.equal(arr.length, 3);
        assert.deepEqual(arr, ['AAA', 'BBB', 'CCC']);
        cb();
      });
    });
  });
});
