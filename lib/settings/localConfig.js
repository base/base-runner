'use strict';

var path = require('path');
var utils = require('../utils');

module.exports = function(app, filename) {
  var configname = path.basename(filename, path.extname(filename));
  var files = utils.glob.sync(configname + '.*', { cwd: app.cwd });
  var len = files.length;
  var idx = -1;
  var res = {};

  while (++idx < len) {
    var name = files[idx];
    var ext = path.extname(name);

    var configpath = path.resolve(app.cwd, name);
    if (ext === '.json') {
      utils.merge(res, require(configpath));
    }
  }
  return res;
};
