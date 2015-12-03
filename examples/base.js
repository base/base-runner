'use strict';

console.time('resolver');
var glob = require('matched');
var gm = require('global-modules');
var Assemble = require('assemble-core');
var runner = require('..');

function Generate(options) {
  Assemble.apply(this, arguments);
  this.isGenerate = true;
  this.generators = {};
}
Assemble.extend(Generate);

Generate.mixin(runner('generate', 'generator'));

var app = Generate.getConfig('generator.js')
  .resolve('generate-*/generator.js', {
    cwd: gm
  });

console.log(app)
console.timeEnd('resolver');

