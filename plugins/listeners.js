'use strict';

/**
 * This is a `runner` plugin
 */

module.exports = function(options) {
  options = options || {};

  return function(app) {

    app.define('addListeners', function() {
      if (this.base.disabled('verbose')) return;
      var store = ['store.set', 'store.has', 'store.get', 'store.del'];
      var methods = ['set', 'has', 'get', 'del', 'option', 'data'];

      var names = store.concat(methods);
      var len = names.length,
        i = -1;
      var multi = this;

      while (++i < len) {
        var method = names[i];
        var prop = method.split('.');

        if (prop.length === 2) {
          this.base[prop[0]].on(prop[1], multi.emit.bind(multi, method));
          this.base[prop[0]].on(prop[1], multi.emit.bind(multi, '*', method));
        } else {
          this.base.on(method, function(key, val) {
            multi.emit(method, key, val);
            multi.emit('*', method, key, val);
          });
        }
      }
    });
  };
};
