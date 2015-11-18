'use strict';

module.exports = function env() {
  return function(app) {
    app.env = {};
    app.env.cwd = process.cwd();
  }
};
