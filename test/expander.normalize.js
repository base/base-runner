'use strict';

require('mocha');
var path = require('path');
var assert = require('assert');
var generators = require('base-generators');
var Base = require('base');
var base;

var runner = require('..');

describe('.field.normalize', function() {
  beforeEach(function() {
    base = new Base();
    base.use(generators());
    base.use(runner());
  });

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
