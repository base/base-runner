
var Base = require('base-methods');

function Generate(options) {
  Base.call(this);
  this.use(cli());

  this.use(argv({
    commands: ['set', 'get', 'del']
  }));
}

Base.extend(App);
