'use strict';

require('mocha');
var assert = require('assert');
var Generate = require('generate');
var runner = require('./');
var base;

describe('errors', function() {
  beforeEach(function() {
    base = new Generate();
  });

  it('should throw an error when moduleName is not defined', function(cb) {
    try {
      base.use(runner());
      cb(new Error('exected an error'));
    } catch (err) {
      assert(err);
      assert.equal(err.message, 'expected "moduleName" to be a string');
      cb();
    }
  });

  it('should throw an error when appName is not defined', function(cb) {
    try {
      base.use(runner('foo'));
      cb(new Error('exected an error'));
    } catch (err) {
      assert(err);
      assert.equal(err.message, 'expected "appName" to be a string');
      cb();
    }
  });

  it('should throw an error when used as an instance plugin', function(cb) {
    try {
      base.use(runner('generate', 'generator'));
      cb(new Error('exected an error'));
    } catch (err) {
      assert(err);
      assert(/instance plugin/.test(err.message));
      cb();
    }
  });
});

describe('runner', function() {
  beforeEach(function() {
    Generate.mixin(runner('generate', 'generator'))
    base = Generate.getConfig('generator.js', 'generate');
  });

  it('should decorate a `resolve` method onto the instance', function() {
    assert.equal(typeof base.resolve, 'function');
  });

  it('should emit an `env` object for files that match the given pattern', function(cb) {
    base.once('config', function(key, env) {
      assert(env);
      assert(env.config);
      assert(env.config.path);
      cb();
    });
    base.resolve({pattern: '**/generator.js', cwd: 'examples'});
  });

  it('should emit an `env.module` object', function(cb) {
    base.once('config', function(key, env) {
      assert(env);
      assert(env.module);
      assert(env.module.path);
      cb();
    });
    base.resolve({pattern: '**/generator.js', cwd: 'examples'});
  });
});
