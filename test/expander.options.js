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
      base.runner('foofile.js', {aaa: 'bbb'}, function(err) {
        if (err) return cb(err);
        assert.equal(base.options.aaa, 'bbb');
        cb();
      });
    });
  });
});
