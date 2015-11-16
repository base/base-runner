'use strict';

var util = require('util');
var Config = require('./config');

function Generator() {
  Config.apply(this, arguments);
}

util.inherits(Generator, Config);

/**
 * Expose Generator
 */

module.exports = Generator;
