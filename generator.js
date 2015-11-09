'use strict';

module.exports = function (app, base, env) {
  var foo = env.argv('a.b.c');

  app.subgenerator('foo', './subgenerator');
};
