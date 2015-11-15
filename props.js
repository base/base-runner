'use strict';

var fs = require('fs');
var path = require('path');
var glob = require('matched');
var union = require('union-value');
var unique = require('array-unique');
var camelcase = require('camelcase');

var requireRe = /^require\((.*)\)/gm;
var re = /(?!^|\s)(\w+)\.[\w(]+(?=\()/g;

function getRequires(str, namespace) {
  namespace = namespace || 'utils';
  var requires = str.match(requireRe);
  if (!requires) return [];

  var len = requires.length, i = -1;
  var props = [];

  while (++i < len) {
    var req = requires[i];
    var prop = req.replace(/^require/, '');

    if (/,/.test(prop)) {
      prop = prop.split(',').pop();
    }
    prop = prop.replace(/^\W+|\W+$/g, '');
    prop = camelcase(prop);
    props.push(namespace + '.' + prop);
  }
  return props;
}

function detect(fp, str, options) {
  options = options || {};
  var file = {
    path: fp,
    props: options.props || [],
    namespaces: []
  };

  var namespace = options.namespace || 'utils';
  var reqs = getRequires(str, namespace);
  var matches = (str.match(re) || []).concat(reqs);
  console.log(matches)

  var len = matches.length, i = -1;

  while (++i < len) {
    var prop = matches[i].replace(/^\W+/, '');
    var segs = prop.split('.');

    if (segs[0] !== namespace) continue;
    union(file.namespaces, segs[0], segs[1]);

    if (file.props.indexOf(prop) === -1) {
      file.props.push(prop);
    }
  }
  return file;
}

function detectProps(pattern, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }

  opts = opts || {};
  var res = {all: [], files: []};

  glob(pattern, function(err, files) {
    if (err) return console.log(err);

    files.forEach(function(fp) {
      var str = fs.readFileSync(fp, 'utf8');
      var file = detect(fp, str, opts);
      res.all = res.all.concat(file.props).sort();
      union(res, 'all', file.props);
      res.files.push(file);
    });

    res.all = unique(res.all);
    cb(null, res);
  });
}

var lint = ['index.js', 'lib/*.js', 'plugins/*.js'];
var opts = {name: 'utils'};

detectProps('lib/utils.js', opts, function (err, res) {
  if (err) return console.log(err);
  var all = res.all;

    console.log(all)
  // detectProps(lint, opts, function (err, props) {
  // });
});




/**
 * Expose detect
 */

module.exports = detect;

