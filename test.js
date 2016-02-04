'use strict';

require('mocha');
var assert = require('assert');
var task = require('base-task');
var Base = require('base');
var base;

var runner = require('./');

describe('base-runner', function() {
  describe('plugin', function() {
    it('should export a function', function() {
      assert.equal(typeof runner, 'function');
    });

    it('should register as a plugin', function() {
      base = new Base();
      base.use(runner());
      assert(base.registered.hasOwnProperty('base-runner'));
    });

    it('should expose a runner method', function() {
      base = new Base();
      base.use(runner());
      assert.equal(typeof base.runner, 'function');
    });
  });

  describe('base.store', function() {
    it('should expose an base.store object', function() {
      base = new Base();
      base.use(runner());
      assert.equal(typeof base.store, 'object');
    });

    it('should use the name of the app for the store', function() {
      base = new Base();
      base.use(runner());
      assert.equal(base.store.name, 'base');
    });

    it('should expose an base.store.local object', function() {
      base = new Base();
      base.use(runner());
      assert.equal(typeof base.store.local, 'object');
    });

    it('should set pkg.data on base.store.local.data', function() {
      base = new Base();
      base.use(runner());
      assert(base.store.local.data);
      assert(base.store.local.data.name);
      assert.equal(base.store.local.data.name, 'base-runner');
    });

    it('should allow base.store.local setter to be defined', function() {
      base = new Base();
      base.use(runner());
      base.store.local = {};
      assert.deepEqual(base.store.local, {});
    });

    it('should set properties on base.store.local.data', function() {
      base = new Base();
      base.use(runner());
      base.store.local.set('a', 'b');
      assert.equal(base.store.local.data.a, 'b');
    });
  });

  describe('base.pkg', function() {
    it('should expose an base.pkg object', function() {
      base = new Base();
      base.use(runner());
      assert.equal(typeof base.pkg, 'object');
    });

    it('should expose an base.pkg.get method', function() {
      base = new Base();
      base.use(runner());
      assert.equal(base.pkg.get('name'), 'base-runner');
    });
  });
});
