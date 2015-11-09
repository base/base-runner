
var Base = require('base-methods');

function App() {
  Base.call(this);
  this.use(argv());
}

Base.extend(App);
