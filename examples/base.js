'use strict';

console.time('resolver');
var glob = require('matched');
var gm = require('global-modules');
var resolver = require('base-resolver');
var Assemble = require('assemble-core');
var runner = require('..');

function Generate(options) {
  Assemble.call(this);
  this.options = options || {};
  this.isGenerate = true;
  this.generators = {};
  this.use(resolver('generate'));
}
Assemble.extend(Generate);

Generate.mixin(runner('generate', 'generator'));

var app = Generate.getConfig('generator.js')
  .resolve('generate-*/generator.js', {
    cwd: gm
  });

console.log(app)
console.timeEnd('resolver');

