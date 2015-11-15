'use strict';

var utils = require('../lib/utils');
var path = require('path');

/**
 * This is a "base" plugin
 */

module.exports = function(options) {
  options = options || {};
  var base = options.base;

  return function (app) {
    var opts = utils.extend({}, this.options, options);

    if (!opts.path) {
      throw new Error('expected options.path to be a string');
    }

    // base.define('getFile', app.getFile);
    // base.files.getFile = base.files.getView.bind(base.files);
    // app.create('templates', {
    //   cwd: path.resolve(opts.path, 'templates'),
    //   renameKey: function (key) {
    //     return path.basename(key);
    //   }
    // });

    // app.define('getFile', function(name) {
    //   var view;
    //   if (base) {
    //     view = base.getFile.apply(base, arguments);
    //   }

    //   if (!view) {
    //     view = app.files.getView.apply(app.files, arguments);
    //   }

    //   if (!view) {
    //     view = app.templates.getView.apply(app.templates, arguments);
    //   }
    //   view.basename = view.basename.replace(/^_/, '.');
    //   return view;
    // });
  };
}
