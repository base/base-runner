# base-runner [![NPM version](https://img.shields.io/npm/v/base-runner.svg)](https://www.npmjs.com/package/base-runner) [![Build Status](https://img.shields.io/travis/jonschlinkert/base-runner.svg)](https://travis-ci.org/jonschlinkert/base-runner)

> Orchestrate multiple instances of base-methods at once.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm i base-runner --save
```

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
* `callback` **{Function}**: Callback that exposes `err`, `argv` and `app` as arguments. `argv` is pre-processed by [minimist](https://github.com/substack/minimist) then processed by [expand-args][]. The original `argv` array is exposed on `argv.orig`, and the object returned by minimist is exposed on `argv.minimist`. `app` is the resolved application instance to be used.
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

## Related projects

* [base](https://www.npmjs.com/package/base): base is the foundation for creating modular, unit testable and highly pluggable node.js applications, starting… [more](https://www.npmjs.com/package/base) | [homepage](https://github.com/node-base/base)
* [base-generators](https://www.npmjs.com/package/base-generators): Adds project-generator support to your `base` application. | [homepage](https://github.com/jonschlinkert/base-generators)
* [base-options](https://www.npmjs.com/package/base-options): Adds a few options methods to base-methods, like `option`, `enable` and `disable`. See the readme… [more](https://www.npmjs.com/package/base-options) | [homepage](https://github.com/jonschlinkert/base-options)
* [base-plugins](https://www.npmjs.com/package/base-plugins): Upgrade's plugin support in base-methods to allow plugins to be called any time after init. | [homepage](https://github.com/jonschlinkert/base-plugins)
* [base-store](https://www.npmjs.com/package/base-store): Plugin for getting and persisting config values with your base-methods application. Adds a 'store' object… [more](https://www.npmjs.com/package/base-store) | [homepage](https://github.com/jonschlinkert/base-store)
* [base-tasks](https://www.npmjs.com/package/base-tasks): base-methods plugin that provides a very thin wrapper around [https://github.com/jonschlinkert/composer](https://github.com/jonschlinkert/composer) for adding task methods to… [more](https://www.npmjs.com/package/base-tasks) | [homepage](https://github.com/jonschlinkert/base-tasks)

## Running tests

Install dev dependencies:

```sh
$ npm i -d && npm test
```

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/jonschlinkert/base-runner/issues/new).

## Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License

Copyright © 2016 [Jon Schlinkert](https://github.com/jonschlinkert)
Released under the [MIT license](https://github.com/jonschlinkert/base-runner/blob/master/LICENSE).

***

_This file was generated by [verb](https://github.com/verbose/verb), v0.9.0, on February 09, 2016._