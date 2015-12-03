'use strict';

// console.time('resolver');
var glob = require('matched');
var gm = require('global-modules');
// console.time('assemble');
var Assemble = require('assemble-core');
var runner = require('..');

function Generate(options) {
  Assemble.apply(this, arguments);
  this.isGenerate = true;
  this.generators = {};
}
Assemble.extend(Generate);
// console.timeEnd('assemble');

// console.time('mixin');
Generate.mixin(runner('generate', 'generator'));
// console.timeEnd('mixin');

// console.time('getConfig');
var app = Generate.getConfig('generator.js')
  .resolve('generate-*/generator.js', {
    cwd: gm
  });
// console.timeEnd('getConfig');

// console.log(app)
// console.timeEnd('resolver');

