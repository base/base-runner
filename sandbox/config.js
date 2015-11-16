'use strict';

var fs = require('fs');
var path = require('path');
var utils = require('../lib/utils');
var cache = {};

module.exports = function Config(fp, opts) {
  opts = opts || {};
  this.options = opts;
  this.configfile = fp;
  this.dir = path.dirname(fp);
  this.name = path.basename(this.dir);
  this.alias = utils.alias(this.name);
  this.Ctor = resolveModule(this.dir, 'generate', opts) || opts.Ctor;
  this.fn = require(fp);
};

function resolveModule(cwd, name, options) {
  if (cache.hasOwnProperty(name)) {
    return cache[name];
  }
  var opts = utils.extend({cwd: ''}, options);
  var dir = path.join(opts.cwd, 'node_modules/', name);
  if (fs.existsSync(dir)) {
    var res = require(path.resolve(dir));
    cache[name] = res;
    return res;
  }
  return null;
}
