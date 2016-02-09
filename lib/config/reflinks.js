'use strict';

module.exports = function(app) {
  return function(val) {
    return Array.isArray(val) ? val : [val];
  };
};
