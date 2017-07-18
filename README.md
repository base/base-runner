# base-runner [![NPM version](https://img.shields.io/npm/v/base-runner.svg?style=flat)](https://www.npmjs.com/package/base-runner) [![NPM monthly downloads](https://img.shields.io/npm/dm/base-runner.svg?style=flat)](https://npmjs.org/package/base-runner) [![NPM total downloads](https://img.shields.io/npm/dt/base-runner.svg?style=flat)](https://npmjs.org/package/base-runner) [![Linux Build Status](https://img.shields.io/travis/node-base/base-runner.svg?style=flat&label=Travis)](https://travis-ci.org/node-base/base-runner)

> Orchestrate multiple instances of base-methods at once.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save base-runner
```

## Usage

```js
var runner = require('base-runner');
var Base = require('base');

runner(Base, options, argv, function(err, app, runnerContext) {
  // `err`: error object, if an error occurred
  // `app`: instance of `base` 
  // `runnerContext`: object with `argv`, `env` and `options` properties
});
```

**Params**

* `Base` - (required) [base](https://github.com/node-base/base) constructor
* `options` - (required) configuration options
* `argv` - (required) parsed `process.argv` object from [minimist](https://github.com/substack/minimist) or whatever argv parser you prefer.

### Example

```js
var runner = require('base-runner');
var Base = require('base');
var config = {
  name: 'awesome',
  cwd: process.cwd(),
  runner: require('./package.json'),
  processTitle: 'awesome',
  moduleName: 'awesome',
  extensions: {
    '.js': null
  }
};

runner(Base, options, argv, function(err, app, runnerContext) {
  // `err`: error object, if an error occurred
  // `app`: instance of `base` 
  // `runnerContext`: object with `argv`, `env` and `options` properties
});
```

## API

### [runner](index.js#L40)

Create a `runner` with the given `constructor`, [liftoff](https://github.com/js-cli/js-liftoff) `config` object, `argv` object and `callback` function.

**Params**

* `Ctor` **{Function}**: Constructor to use, must inherit [base](https://github.com/node-base/base).
* `config` **{Object}**: The config object to pass to [liftoff](https://github.com/js-cli/js-liftoff).
* `argv` **{Object}**: Argv object, optionally pre-parsed.
* `cb` **{Function}**: Callback function, which exposes `err`, `app` (base application instance) and `runnerContext`
* `returns` **{Object}**

**Example**

```js
var Base = require('base');
var argv = require('minimist')(process.argv.slice(2));
var config = {
  name: 'foo',
  cwd: process.cwd(),
  extensions: {'.js': null}
};

runner(Base, config, argv, function(err, app, runnerContext) {
  if (err) throw err;
  // do stuff with `app` and `runnerContext`
  process.exit();
});
```

## Events

The following constructor events are emitted:

* [preInit](#preInit)
* [init](#init)
* [postInit](#postInit)

### preInit

Exposes `runnerContext` as the only paramter.

```js
Base.on('preInit', function(runnerContext) {
});
```

### init

Exposes `runnerContext` and `app` (the application instance) as paramters.

```js
Base.on('init', function(runnerContext, app) {
});
```

### postInit

Exposes `runnerContext` and `app` (the application instance) as paramters.

```js
Base.on('postInit', function(runnerContext, app) {
});
```

### finished

Exposes `runnerContext` and `app` (the application instance) as paramters.

```js
Base.on('finished', function(runnerContext, app) {
});
```

## About

### Related projects

* [base-generators](https://www.npmjs.com/package/base-generators): Adds project-generator support to your `base` application. | [homepage](https://github.com/node-base/base-generators "Adds project-generator support to your `base` application.")
* [base-option](https://www.npmjs.com/package/base-option): Adds a few options methods to base, like `option`, `enable` and `disable`. See the readme… [more](https://github.com/node-base/base-option) | [homepage](https://github.com/node-base/base-option "Adds a few options methods to base, like `option`, `enable` and `disable`. See the readme for the full API.")
* [base-plugins](https://www.npmjs.com/package/base-plugins): Adds 'smart plugin' support to your base application. | [homepage](https://github.com/node-base/base-plugins "Adds 'smart plugin' support to your base application.")
* [base-store](https://www.npmjs.com/package/base-store): Plugin for getting and persisting config values with your base-methods application. Adds a 'store' object… [more](https://github.com/node-base/base-store) | [homepage](https://github.com/node-base/base-store "Plugin for getting and persisting config values with your base-methods application. Adds a 'store' object that exposes all of the methods from the data-store library. Also now supports sub-stores!")
* [base-task](https://www.npmjs.com/package/base-task): base plugin that provides a very thin wrapper around [https://github.com/doowb/composer](https://github.com/doowb/composer) for adding task methods to… [more](https://github.com/node-base/base-task) | [homepage](https://github.com/node-base/base-task "base plugin that provides a very thin wrapper around <https://github.com/doowb/composer> for adding task methods to your application.")
* [base](https://www.npmjs.com/package/base): Framework for rapidly creating high quality node.js applications, using plugins like building blocks | [homepage](https://github.com/node-base/base "Framework for rapidly creating high quality node.js applications, using plugins like building blocks")

### Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

### Contributors

| **Commits** | **Contributor** | 
| --- | --- |
| 239 | [jonschlinkert](https://github.com/jonschlinkert) |
| 2 | [doowb](https://github.com/doowb) |
| 1 | [tunnckoCore](https://github.com/tunnckoCore) |

### Building docs

_(This project's readme.md is generated by [verb](https://github.com/verbose/verb-generate-readme), please don't edit the readme directly. Any changes to the readme must be made in the [.verb.md](.verb.md) readme template.)_

To generate the readme, run the following command:

```sh
$ npm install -g verbose/verb#dev verb-generate-readme && verb
```

### Running tests

Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

```sh
$ npm install && npm test
```

### Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](https://twitter.com/jonschlinkert)

### License

Copyright © 2017, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT License](LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.6.0, on July 18, 2017._