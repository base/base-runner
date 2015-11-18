'use strict';

var utils = require('./utils');

function parseTask(str) {
  var arr = str.split(':');
  var key = arr[0];
  var val = arr[1];
  var res = {};

  if (arr.length === 1) {
    utils.union(res, 'base', key);
  } else if (key === 'base') {
    utils.union(res, 'base', val);
  } else {
    key = key.split('.').join('\\.');
    utils.union(res, key, val.split(','));
  }
  return res;
}

function toTasks(tasks) {
  if (typeof tasks === 'string') {
    if (!/[\W.]/.test(tasks)) {
      return { base: [tasks] };
    }
  }

  if (Array.isArray(tasks)) {
    return tasks.reduce(function(acc, str) {
      return acc.concat(toTasks(str));
    }, []);
  }

  var arr = tasks.split('|');
  var len = arr.length, i = -1;
  var res = [];

  while (++i < len) {
    var obj = parseTask(arr[i]);
    res.push(obj);
  }
  return res;
}

/**
 * expose `toTasks`
 */

module.exports = toTasks;
