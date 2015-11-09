
var Base = require('base-methods');

function Assemble() {
  Base.call(this);
  this.use(argv());
}

Base.extend(Assemble);
