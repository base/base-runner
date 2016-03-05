# base-runner [![NPM version](https://img.shields.io/npm/v/base-runner.svg)](https://www.npmjs.com/package/base-runner) [![Build Status](https://img.shields.io/travis/jonschlinkert/base-runner.svg)](https://travis-ci.org/jonschlinkert/base-runner)

> Orchestrate multiple instances of base-methods at once.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install base-runner --save
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
* `callback` **{Function}**: Callback that exposes `err`, `argv` and `app` as arguments. `argv` is pre-processed by [minimist](https://github.com/substack/minimist) then processed by [expand-args](https://github.com/jonschlinkert/expand-args). The original `argv` array is exposed on `argv.orig`, and the object returned by minimist is exposed on `argv.minimist`. `app` is the resolved application instance to be used.
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

### [.cwd](lib/config/cwd.js#L18)

Set the current working directory.

**Example**

```json
{
  "name": "my-project",
  "verb": {
    "cwd": "foo/bar"
  }
}
```

### [.data](lib/config/data.js#L23)

Merge data onto the `app.cache.data` object. If the [base-data](https://github.com/jonschlinkert/base-data) plugin is registered, this is the API-equivalent of calling `app.data()`.

**Example**

```json
{
  "name": "my-project",
  "verb": {
    "data": {
      "foo": "bar"
    }
  }
}
```

### [.engines](lib/config/engine.js#L12)

Alias for [engines](#engines)

### [.engines](lib/config/engines.js#L26)

_(Requires [templates](https://github.com/jonschlinkert/templates), otherwise ignored)_

Register engines to use for rendering templates. Object-keys are used
for the engine name, and the value can either be the module name, or
an options object with the module name defined on the `name` property.
_(Modules must be locally installed and listed in `dependencies` or
`devDependencies`)_.

**Example**

```json
// module name
{"verb": {"engines": {"*": "engine-base"}}}

// options
{"verb": {"engines": {"*": {"name": "engine-base"}}}}
```

### [.helpers](lib/config/helpers.js#L36)

_(Requires [templates](https://github.com/jonschlinkert/templates), otherwise ignored)_

Register helpers to use in templates. Value can be a string or
array of module names, glob patterns, or file paths, or an object
where each key is a filepath, glob or module name, and the value
is an options object to pass to resolved helpers.
_(Modules must be locally installed and listed in `dependencies` or
`devDependencies`)_.

**Example**

```json
// module names
{
  "verb": {
    "helpers": {
      "helper-foo": {},
      "helper-bar": {}
    }
  }
}

// register a glob of helpers
{
  "verb": {
    "helpers": ["foo/*.js"]
  }
}
```

### [.options](lib/config/options.js#L16)

Merge options onto the `app.options` object. If the [base-option](https://github.com/node-base/base-option) plugin is registered, this is the API-equivalent of calling `app.option()`.

**Example**

```json
{"verb": {"options": {"foo": "bar"}}}
```

### [.plugins](lib/config/plugins.js#L19)

Load pipeline plugins. Requires the [base-pipeline](https://github.com/jonschlinkert/base-pipeline) plugin to be registered.

_(Modules must be locally installed and listed in `dependencies` or
`devDependencies`)_.

**Example**

```json
{"verb": {"plugins": {"eslint": {"name": "gulp-eslint"}}}}
```

### [.toc](lib/config/toc.js#L19)

Enable or disable Table of Contents rendering, or pass options on the `verb` config object in `package.json`.

**Example**

```json
{
  "name": "my-project",
  "verb": {
    "toc": true
  }
}
```

### [.use](lib/config/use.js#L20)

Define plugins to load. Value can be a string or array of module names.

_(Modules must be locally installed and listed in `dependencies` or
`devDependencies`)_.

**Example**

```json
{"verb":  {"use": ["base-option", "base-data"]}}
```

## Related projects

* [base](https://www.npmjs.com/package/base): base is the foundation for creating modular, unit testable and highly pluggable node.js applications, starting… [more](https://www.npmjs.com/package/base) | [homepage](https://github.com/node-base/base)
* [base-generators](https://www.npmjs.com/package/base-generators): Adds project-generator support to your `base` application. | [homepage](https://github.com/jonschlinkert/base-generators)
* [base-options](https://www.npmjs.com/package/base-options): Adds a few options methods to base-methods, like `option`, `enable` and `disable`. See the readme… [more](https://www.npmjs.com/package/base-options) | [homepage](https://github.com/jonschlinkert/base-options)
* [base-plugins](https://www.npmjs.com/package/base-plugins): Upgrade's plugin support in base applications to allow plugins to be called any time after… [more](https://www.npmjs.com/package/base-plugins) | [homepage](https://github.com/jonschlinkert/base-plugins)
* [base-store](https://www.npmjs.com/package/base-store): Plugin for getting and persisting config values with your base-methods application. Adds a 'store' object… [more](https://www.npmjs.com/package/base-store) | [homepage](https://github.com/jonschlinkert/base-store)
* [base-tasks](https://www.npmjs.com/package/base-tasks): base-methods plugin that provides a very thin wrapper around [https://github.com/jonschlinkert/composer](https://github.com/jonschlinkert/composer) for adding task methods to… [more](https://www.npmjs.com/package/base-tasks) | [homepage](https://github.com/jonschlinkert/base-tasks)

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/jonschlinkert/base-runner/issues/new).

## Building docs

Generate readme and API documentation with [verb](https://github.com/verbose/verb):

```sh
$ npm install verb && npm run docs
```

Or, if [verb](https://github.com/verbose/verb) is installed globally:

```sh
$ verb
```

## Running tests

Install dev dependencies:

```sh
$ npm install -d && npm test
```

## Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License

Copyright © 2016 [Jon Schlinkert](https://github.com/jonschlinkert)
Released under the [MIT license](https://github.com/jonschlinkert/base-runner/blob/master/LICENSE).

***

_This file was generated by [verb](https://github.com/verbose/verb), v0.9.0, on March 05, 2016._