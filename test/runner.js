'use strict';

require('mocha');
var assert = require('assert');
var task = require('base-task');
var Base = require('base');
var base;

var runner = require('..');

describe('base-runner', function() {
  beforeEach(function() {
    base = new Base();
    base.use(runner());
  });

  describe('plugin', function() {
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

  describe('base.store', function() {
    it('should expose an base.store object', function() {
      assert.equal(typeof base.store, 'object');
    });

    it('should use the name of the app for the store', function() {
      assert.equal(base.store.name, 'base');
    });

    it('should expose an base.store.local object', function() {
      assert.equal(typeof base.store.local, 'object');
    });

    it('should set pkg.data on base.store.local.data', function() {
      assert(base.store.local.data);
      assert(base.store.local.data.name);
      assert.equal(base.store.local.data.name, 'base-runner');
    });

    it('should allow base.store.local setter to be defined', function() {
      base.store.local = {};
      assert.deepEqual(base.store.local, {});
    });

    it('should set properties on base.store.local.data', function() {
      base.store.local.set('a', 'b');
      assert.equal(base.store.local.data.a, 'b');
    });
  });

  describe('base.pkg', function() {
    it('should expose an base.pkg object', function() {
      assert.equal(typeof base.pkg, 'object');
    });

    it('should expose an base.pkg.get method', function() {
      assert.equal(base.pkg.get('name'), 'base-runner');
    });
  });

  describe('base.project', function() {
    it('should expose an base.project getter/setter', function() {
      assert.equal(typeof base.project, 'string');
    });

    it('should get the project name', function() {
      assert.equal(base.project, 'base-runner');
    });
  });

  describe('base.cwd', function() {
    it('should expose an base.cwd getter/setter', function() {
      assert.equal(typeof base.cwd, 'string');
    });

    it('should get the working directory', function() {
      assert.equal(base.cwd, process.cwd());
    });
  });
});
