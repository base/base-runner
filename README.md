## Usage

```js
var runner = require('base-runner');
var Base = require('base');
var base = new Base();
```

**Register the plugin**

```js
base.use(runner());
```

With the plugin registered, you can now call the `.runner` method with the name of the "configfile" to search for (e.g. `verbfile.js`, `generator.js`, `assemblefile.js`, etc):

```js
base.runner('configfile.js', function(err, argv, app) {
  // `err`: error object
  // `argv`: command line arguments, parsed by minimist and pre-processed
  // `app`: instance of `base` with configfile.js invoked
});
```

**Example usage**

```js
base.runner('generator.js', function(err, argv, app) {
  if (err) throw err;

  app.cli.process(argv, function(err) {
    if (err) throw err;

  });
});
```

## API

**Params**

* `configfile` **{String}**: The name of the configfile to initialize with. For example, `generator.js`, `assemblefile.js`, `verbfile.js` etc.    
* `callback` **{Function}**: Callback that exposes `err`, `argv` and `app` as arguments. `argv` is pre-processed by [minimist] then processed by [expand-args]. The original `argv` array is exposed on `argv.orig`, and the object returned by minimist is exposed on `argv.minimist`. `app` is the resolved application instance to be used.    
* `returns` **{undefined}**  

**Example**

```js
base.runner('verbfile.js', function(err, argv, app) {
  // handle err
  // do stuff with argv and app

  app.cli.process(argv, function(err) {
    // handle err
  });
});
```

