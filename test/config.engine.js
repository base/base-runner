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

  describe('engine', function() {
    it('should error when engine is not an object', function(cb) {
      base.config.process({engine: 'engine-base'}, function(err, config) {
        assert(config.engines.hasOwnProperty('base'));
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
