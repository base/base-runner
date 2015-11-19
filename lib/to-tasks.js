'use strict';

var utils = require('./utils');

/**
 * expose `toTasks`
 */

module.exports = function toTasks(tasks, app) {
  tasks = utils.arrayify(tasks);
  tasks = tasks.reduce(function(acc, str) {
    return acc.concat(str);
  }, []);

  var len = tasks.length, i = -1;
  var res = [];
  var prevKey;

  while (++i < len) {
    var task = tasks[i].split(':');
    var key = task[0];
    var val = task[1];

    if (!val) {
      if (app.generators.hasOwnProperty(key)) {
        val = Object.keys(app.generators[key].tasks);
      } else {
        val = key;
        key = 'base';
      }
    }

    if (typeof val === 'string') {
      val = val.split(',');
    }

    if (prevKey === key) {
      var item = res[i - 1];
      item[prevKey] = item[prevKey].concat(val);
    } else {
      var obj = {};
      obj[key] = val;
      res.push(obj);
    }

    prevKey = key;
  }
  return res;
};
