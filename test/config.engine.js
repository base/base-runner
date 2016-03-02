'use strict';

require('mocha');
var assert = require('assert');
var generators = require('base-generators');
var assemble = require('assemble-core');
var base, app;

var runner = require('..');
require('engine-base');

describe('.config.engine', function() {
  beforeEach(function() {
    base = assemble();
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

  describe('engine', function() {
    it('should error when engine is not an object', function(cb) {
      base.config.process({engine: 'engine-base'}, function(err) {
        assert(err);
        assert.equal(err.message, 'base-runner#engine expected engine to be an object');
        cb();
      });
    });

    it('should register an engine by object key', function(cb) {
      base.config.process({engine: {'*': 'engine-base'}}, function(err) {
        assert(base.engines.hasOwnProperty('.*'));
        cb();
      });
    });
  });
});
