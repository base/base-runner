'use strict';

require('mocha');
var path = require('path');
var assert = require('assert');
var assemble = require('assemble-core');
var generators = require('base-generators');
var Base = require('base');
var base;

var runner = require('..');

describe('.field.create', function() {
  beforeEach(function() {
    base = assemble();
    base.use(generators());
    base.use(runner());
  });

  it('should create a template collection', function(cb) {
    base.option('create', {
      pages: {}
    });

    base.runner('foo.js', function(err, argv, app) {
      assert(!err);
      assert(app.views.hasOwnProperty('pages'));
      cb();
    });
  });
});
