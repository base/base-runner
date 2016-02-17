'use strict';

module.exports = function(app) {
  return app.option('settings.store.data') || app.store.local.data;
};
