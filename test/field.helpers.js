'use strict';

require('mocha');
var assert = require('assert');
var task = require('base-task');
var Base = require('base');
var base;

var runner = require('..');

describe('.field.helpers', function() {
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
});
