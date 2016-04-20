'use strict';

require('mocha');
var path = require('path');
var assert = require('assert');
var argv = require('minimist')(process.argv.slice(2));
var Base = require('./support');
var base;

var fixtures = path.resolve.bind(path, __dirname, 'fixtures');
var runner = require('..');
var config = {
  name: 'foo',
  cwd: fixtures(),
  runner: require(fixtures('package.json')),
  processTitle: 'foo',
  moduleName: 'foo',
  extensions: {
    '.js': null
  }
};

describe('.runnerContext', function() {
  var error = console.error;

  beforeEach(function() {
    console.error = function() {};
  });

  afterEach(function() {
    console.error = error;
  });

  it('should set the configFile on `env.configFile`', function(cb) {
    runner(Base, config, argv, function(err, app, runnerContext) {
      if (err) return cb(err);
      assert.equal(runnerContext.env.configFile, 'foofile.js');
      cb();
    });
  });

  it('should set "env" on app.cache.runnerContext', function(cb) {
    runner(Base, config, argv, function(err, app, runnerContext) {
      if (err) return cb(err);
      assert(app.cache.runnerContext.env);
      assert.equal(typeof app.cache.runnerContext.env, 'object');
      cb();
    });
  });

  it('should set "config" on app.cache.runnerContext', function(cb) {
    runner(Base, config, argv, function(err, app, runnerContext) {
      if (err) return cb(err);
      assert(app.cache.runnerContext.config);
      assert.equal(typeof app.cache.runnerContext.config, 'object');
      cb();
    });
  });

  it('should set the configFile on app.cache.runnerContext.env', function(cb) {
    runner(Base, config, argv, function(err, app, runnerContext) {
      if (err) return cb(err);
      assert.equal(app.cache.runnerContext.env.configFile, 'foofile.js');
      cb();
    });
  });

  it('should set cwd on the instance', function(cb) {
    runner(Base, config, {cwd: fixtures()}, function(err, app, runnerContext) {
      if (err) return cb(err);
      assert.equal(app.cwd, fixtures());
      cb();
    });
  });

  it('should resolve configpath from app.cwd and app.configFile', function(cb) {
    runner(Base, config, {cwd: fixtures()}, function(err, app, runnerContext) {
      if (err) return cb(err);
      assert.equal(app.cache.runnerContext.env.configPath, path.resolve(__dirname, 'fixtures/foofile.js'));
      cb();
    });
  });
});
