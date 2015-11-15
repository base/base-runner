# Runner

Consists of 4 modules

* `base-env`
* `base-resolver`
* `base-argv`
* `base-runner`


**Example**

```js
function Runner(options) {
  Base.call(this);

  this.use(env());      // builds up env
  this.use(resolver()); // resolves modules, configs
  this.use(argv());     // adds specialed argv parsing
  this.use(runner());   // adds `this.base`, `run`, etc
}
Base.extend(Runner);
```
