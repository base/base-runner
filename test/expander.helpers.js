'use strict';

require('mocha');
var assert = require('assert');
var generators = require('base-generators');
var Base = require('base');
var base;

var runner = require('..');

describe('.field.helpers', function() {
  beforeEach(function() {
    base = new Base();
    base.use(generators());
    base.use(runner());
  });


});
