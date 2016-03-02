'use strict';

require('mocha');
var assert = require('assert');
var generators = require('base-generators');
var Base = require('base');
var base, app;

var runner = require('..');

describe('.config.data', function() {
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

  describe('data', function() {
    it('should merge data onto app.cache.data', function(cb) {
      base.config.process({data: {a: 'b'}}, function(err) {
        if (err) return cb(err);
        assert.equal(base.cache.data.a, 'b');
        cb();
      });
    });

    it('should emit `data`', function(cb) {
      base.on('data', function(key, val) {
        assert.equal(key, 'a');
        assert.equal(val, 'b');
        cb();
      });

      base.config.process({data: {a: 'b'}}, function(err) {
        if (err) return cb(err);
      });
    });
  });
});
