'use strict';

require('mocha');
var assert = require('assert');
var generators = require('base-generators');
var Base = require('base');
var base, app;

var runner = require('..');

describe('.config.options', function() {
  beforeEach(function() {
    base = new Base();
    base.use(generators());
    base.use(runner());
  });
  
  describe('options', function() {
    it('should merge options onto app.options', function(cb) {
      base.config.process({options: {a: 'b'}}, function(err) {
        if (err) return cb(err);
        assert.equal(base.options.a, 'b');
        cb();
      });
    });

    it('should emit `options`', function(cb) {
      base.on('option', function(key, val) {
        assert.equal(key, 'a');
        assert.equal(val, 'b');
        cb();
      });

      base.config.process({options: {a: 'b'}}, function(err) {
        if (err) return cb(err);
      });
    });
  });
});
