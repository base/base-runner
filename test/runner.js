'use strict';

require('mocha');
var path = require('path');
var assert = require('assert');
var generators = require('base-generators');
var Base = require('base');
var base;

var runner = require('..');

describe('.runner', function() {
  beforeEach(function() {
    base = new Base();
    base.use(generators());
    base.use(runner());
  });

  describe('methods', function() {
    it('should expose a base.runner method', function() {
      assert.equal(typeof base.runner, 'function');
    });

    it('should expose a base.sortArgs method', function() {
      assert.equal(typeof base.sortArgs, 'function');
    });
  });

  describe('configfile', function() {
    it('should set the configfile on the instance', function(cb) {
      base.runner('foofile.js', function(err, argv, app) {
        assert(!err);
        assert.equal(app.configfile, 'foofile.js');
        cb();
      });
    });

    it('should set the configfile on instance options', function(cb) {
      base.runner('foofile.js', function(err, argv, app) {
        assert(!err);
        assert.equal(app.options.configfile, 'foofile.js');
        cb();
      });
    });

    it('should set cwd on the instance', function(cb) {
      base.cwd = __dirname + '/fixtures';
      base.runner('foofile.js', function(err, argv, app) {
        assert(!err);
        assert.equal(app.cwd, base.cwd);
        cb();
      });
    });

    it('should resolve configpath from app.cwd and app.configfile', function(cb) {
      base.cwd = __dirname + '/fixtures';
      base.runner('foofile.js', function(err, argv, app) {
        assert(!err);
        assert.equal(app.configpath, path.resolve(__dirname, 'fixtures/foofile.js'));
        cb();
      });
    });
  });

  describe('argv', function() {
    it('should expose argv to app', function(cb) {
      base.cwd = __dirname + '/fixtures';
      base.runner('foofile.js', function(err, argv, app) {
        assert(!err);
        assert(argv);
        assert.equal(argv.configfile, 'foofile.js');
        cb();
      });
    });
  });

  describe('errors', function() {
    it('should error when base-generators is not registered first', function(cb) {
      try {
        base = new Base();
        base.use(runner());
      } catch (err) {
        assert.equal(err.message, 'expected the base-generators plugin to be registered');
        cb();
      }
    });

    it('should error when a config file is not passed', function(cb) {
      base.runner(null, function(err, argv, app) {
        assert(err);
        assert.equal(err.message, 'expected configfile to be a string');
        cb();
      });
    });

    it('should error when a callback is not passed', function(cb) {
      try {
        base.runner('foo.js');
      } catch (err) {
        assert.equal(err.message, 'expected a callback function');
        cb();
      }
    });
  });
});
