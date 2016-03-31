'use strict';

require('mocha');
var assert = require('assert');
var generators = require('base-generators');
var assemble = require('assemble-core');
var base, app;

var runner = require('..');
require('engine-base');

describe('.config.helpers', function() {
  beforeEach(function() {
    base = assemble();
    base.use(generators());
    base.use(runner());
  });

  describe('helpers', function() {
    it('should not choke on an empty object', function(cb) {
      var schema = base.schema();
      var config = schema.normalize({
        helpers: {}
      });

      base.config.process(config, cb);
    });

    it('should register an object of helper functions', function(cb) {
      var schema = base.schema();
      var config = schema.normalize({
        helpers: {
          lower: function() {},
          upper: function() {}
        }
      });

      base.config.process(config, function(err) {
        assert(base._.helpers.sync.hasOwnProperty('lower'));
        assert(base._.helpers.sync.hasOwnProperty('upper'));
        cb();
      });
    });

    it('should register an object of helpers by filepaths', function(cb) {
      var schema = base.schema();
      var config = schema.normalize({
        helpers: {
          lower: './test/fixtures/helpers/lower.js',
          upper: './test/fixtures/helpers/upper.js'
        }
      });

      base.config.process(config, function(err) {
        assert(base._.helpers.sync.hasOwnProperty('lower'));
        assert(base._.helpers.sync.hasOwnProperty('upper'));
        cb();
      });
    });

    it('should register an array of helpers by filepaths', function(cb) {
      var schema = base.schema();
      var config = schema.normalize({
        helpers: ['./test/fixtures/helpers/lower.js', './test/fixtures/helpers/upper.js']
      });

      base.config.process(config, function(err) {
        assert(base._.helpers.sync.hasOwnProperty('lower'));
        assert(base._.helpers.sync.hasOwnProperty('upper'));
        cb();
      });
    });

    it('should register an array of helper modules', function(cb) {
      var schema = base.schema();
      var config = schema.normalize({
        helpers: ['helper-coverage', 'helper-example']
      });

      base.config.process(config, function(err) {
        assert(base._.helpers.sync.hasOwnProperty('example'));
        assert(base._.helpers.sync.hasOwnProperty('coverage'));
        cb();
      });
    });

    it('should register a glob of helpers', function(cb) {
      var schema = base.schema();
      var config = schema.normalize({
        helpers: ['./test/fixtures/helpers/*.js']
      });

      base.config.process(config, function(err) {
        assert(base._.helpers.sync.hasOwnProperty('lower'));
        assert(base._.helpers.sync.hasOwnProperty('upper'));
        cb();
      });
    });
  });
});
