'use strict';

module.exports = function(app) {
  var data = app.option('settings.store.data');
  if (data) {
    return data;
  }
  return app.get('store.local.data') || {};
};
