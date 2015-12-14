# base-runner [![NPM version](https://img.shields.io/npm/v/base-runner.svg)](https://www.npmjs.com/package/base-runner) [![Build Status](https://img.shields.io/travis/jonschlinkert/base-runner.svg)](https://travis-ci.org/jonschlinkert/base-runner)

> Orchestrate multiple instances of base-methods at once.

## Install

Install with [npm](https://www.npmjs.com/)

```sh
$ npm i base-runner --save
```

## Usage

```js
var path = require('path');
var runner = require('base-runner');
var Generate = require('generate');

Generate.mixin(runner('generate', 'generator'));

var base = Generate.getConfig('generator.js')
  .resolve('generate-*/generator.js', {
    cwd: '@/'
  })
  .resolve('*/generator.js', {
    cwd: path.join(__dirname, 'fixtures')
  })
  .resolve('generator.js', {
    cwd: __dirname
  });
```

## API

### [.getConfig](index.js#L104)

Static method for getting the very first instance to be used as the `base` instance. The first instance will either be defined by the user, like in local `node_modules`, or a globally installed module that serves as a default/fallback.

**Params**

* `filename` **{String}**: Then name of the config file to lookup.
* `returns` **{Object}**: Returns the "base" instance.

**Example**

```js
var base = Base.getConfig('generator.js');
```

### [.getTask](index.js#L197)

Get task `name` from the `runner.tasks` object.

**Params**

* `name` **{String}**
* `returns` **{Object}**

**Example**

```js
runner.getTask('abc');

// get a task from app `foo`
runner.getTask('foo:abc');

// get a task from sub-app `foo.bar`
runner.getTask('foo.bar:abc');
```

### [.addApp](index.js#L254)

Alias for `register`. Adds an `app` with the given `name`
to the `runner.apps` object.

**Params**

* `name` **{String}**: The name of the config object to register
* `config` **{Object|Function}**: The config object or function

### [.hasApp](index.js#L271)

Return true if app `name` is registered. Dot-notation may be used to check for [sub-apps](#sub-apps).

**Params**

* `name` **{String}**
* `returns` **{Boolean}**

**Example**

```js
base.hasApp('foo.bar.baz');
```

### [.getApp](index.js#L294)

Return app `name` is registered. Dot-notation may be used to get [sub-apps](#sub-apps).

**Params**

* `name` **{String}**
* `returns` **{Boolean}**

**Example**

```js
base.getApp('foo');
// or
base.getApp('foo.bar.baz');
```

### [.extendApp](index.js#L316)

Extend an app.

**Params**

* `app` **{Object}**
* `returns` **{Object}**: Returns the instance for chaining.

**Example**

```js
var foo = base.getApp('foo');
foo.extendApp(app);
```

**Params**

* `apps` **{Object}**
* `done` **{Function}**

**Example**

```js
// run the default tasks for apps `foo` and `bar`
foo.runApps(['foo', 'bar'], function(err) {
  if (err) return console.log(err);
  console.log('done!');
});

// run the specified tasks for apps `foo` and `bar`
var apps = {
  foo: ['a', 'b', 'c'],
  bar: ['x', 'y', 'z']
};

base.runApps(apps, function(err) {
  if (err) return console.log(err);
  console.log('done!');
});
```

### [.invoke](index.js#L382)

Invoke app `fn` with the given `base` instance.

**Params**

* `fn` **{Function}**: The app function.
* `app` **{Object}**: The "base" instance to use with the app.
* `returns` **{Object}**

**Example**

```js
runner.invoke(app.fn, app);
```

### [getConfig](index.js#L443)

If necessary, this static method will resolve the _first instance_ to be used as the `base` instance for caching any additional resolved configs.

**Params**

* `configfile` **{String}**: The name of the config file, ex: `assemblefile.js`
* `moduleName` **{String}**: The name of the module to lookup, ex: `assemble`
* `options` **{Object}**
* `returns` **{Object}**

**Example**

```js
var Generate = require('generate');
var resolver = require('base-resolver');

var generate = resolver.first('generator.js', 'generate', {
  Ctor: Generate,
  isModule: function(app) {
    return app.isGenerate;
  }
});
```

## Related projects

* [base-methods](https://www.npmjs.com/package/base-methods): Starter for creating a node.js application with a handful of common methods, like `set`, `get`,… [more](https://www.npmjs.com/package/base-methods) | [homepage](https://github.com/jonschlinkert/base-methods)
* [base-options](https://www.npmjs.com/package/base-options): Adds a few options methods to base-methods, like `option`, `enable` and `disable`. See the readme… [more](https://www.npmjs.com/package/base-options) | [homepage](https://github.com/jonschlinkert/base-options)
* [base-plugins](https://www.npmjs.com/package/base-plugins): Upgrade's plugin support in base-methods to allow plugins to be called any time after init. | [homepage](https://github.com/jonschlinkert/base-plugins)
* [base-resolver](https://www.npmjs.com/package/base-resolver): 'base-methods' plugin for resolving and loading globally installed npm modules. | [homepage](https://github.com/jonschlinkert/base-resolver)
* [base-store](https://www.npmjs.com/package/base-store): Plugin for getting and persisting config values with your base-methods application. Adds a 'store' object… [more](https://www.npmjs.com/package/base-store) | [homepage](https://github.com/jonschlinkert/base-store)

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

Copyright © 2015 [Jon Schlinkert](https://github.com/jonschlinkert)
Released under the MIT license.

***

_This file was generated by [verb](https://github.com/verbose/verb) on December 14, 2015._