'use strict';

module.exports = function(app) {
  return function(val) {
    app.data(val);
  };
};
