/*!
 * base-generators-cli <https://github.com/jonschlinkert/base-generators-cli>
 *
 * Copyright (c) 2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var extend = require('extend-shallow');
var util = require('generator-util');
var utils = require('./lib/utils');
var cli = require('./lib/cli');

module.exports = function(options) {
  return function(app) {

    /**
     * Register plugins
     */

    this.use(utils.cwd());
    this.use(utils.runtimes());
    this.use(runner());

    /**
     * Register lazily invoked plugins
     */

    this.lazy('cli', cli);
    this.lazy('pkg', pkg);
    this.lazy('store', function() {
      return function() {
        this.use(utils.store(this.constructor.name.toLowerCase()));
        // this.store.local = this.store.create();
        // this.store.local.set(this.pkg.data);
      };
    });
  };
};

function runner(options) {
  return function() {
    this.define('runner', function(configfile, argv, cb) {
      var opts = extend({}, this.options, options, argv);

      var file = util.localConfig(argv.file || configfile, opts);
      if (file) {
        this.register('default', util.tryRequire(file));
      }

      cb(null, createArgs(argv), this);
    });
  };
};

function createArgs(argv) {
  var tasks = argv._;
  delete argv._;

  var keys = Object.keys(argv);
  var len = keys.length;

  argv.tasks = tasks;
  if ((argv.file || len === 0) && tasks.length === 0) {
    argv.tasks = ['default'];
  }

  if (argv.tasks.length === 0 && len > 0) {
    delete argv.tasks;
  }
  return argv;
}

function pkg(options) {
  return function() {
    this.define('pkg', utils.pkg(this.cwd));
    var name = this.pkg.get('name') || utils.project(this.cwd);
    this.data('name', name);
    this.data('varname', utils.namify(name));
  };
}
