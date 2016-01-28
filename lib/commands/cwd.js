'use strict';

module.exports = function(app) {
  return function(val) {
    process.chdir(val);
    app.option('cwd', val);
    console.log('using cwd "%s"', val);
  };
};
