'use strict';

require('mocha');
var assert = require('assert');
var baseRunner = require('./');

describe('base-runner', function() {
  it('should export a function', function() {
    assert.equal(typeof baseRunner, 'function');
  });

  it('should return an object', function() {
    assert.equal(typeof baseRunner, 'object');
  });


var str = 'foo|a.b:c,d,e|one.two:zzz|a.aa.aaa:ax';

// var str = ['base:foo|one.a:ax', 'foo', 'baz'];
// var str = ['base:foo|one.a:ax|bar|base:baz', 'one', 'two'];
// var res = utils.toTasks(str);
// console.log(res)
});
