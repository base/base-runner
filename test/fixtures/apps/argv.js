
module.exports = function (options) {
  return function(app) {
    var args = expandArgs(options);

    app.define('argv', function (prop) {
      return get(args, prop);
    });

    function expandArgs(options) {
      // var commands = options.commands;
      // var apps = options.apps;
      app.commands
    }
  }
}
