'use strict';

require('mocha');
var assert = require('assert');
var generators = require('base-generators');
var Base = require('base');
var base, app;

var runner = require('..');

describe('.config.cwd', function() {
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

  describe('cwd', function() {
    it('should set a cwd on app', function(cb) {
      base.on('cwd', function(val) {
        assert.equal(val, process.cwd());
        cb();
      });

      base.config.process({cwd: process.cwd()}, function(err) {
        if (err) return cb(err);
      });
    });
  });
});
