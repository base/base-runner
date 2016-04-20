'use strict';

var Base = require('base');
var generators = require('base-generators');

Base.use(function() {
  this.isApp = true;
});
Base.use(generators());

module.exports = Base;
