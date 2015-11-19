# base-runner [![NPM version](https://badge.fury.io/js/base-runner.svg)](http://badge.fury.io/js/base-runner)  [![Build Status](https://travis-ci.org/jonschlinkert/base-runner.svg)](https://travis-ci.org/jonschlinkert/base-runner)

> Orchestrate multiple instances of base-methods at once.

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Related projects](#related-projects)
- [About](#about)
  * [What is this?](#what-is-this-)
  * [What can I do with this?](#what-can-i-do-with-this-)
- [Running tests](#running-tests)
- [Contributing](#contributing)
- [Author](#author)
- [License](#license)

## Install

Install with [npm](https://www.npmjs.com/)

```sh
$ npm i base-runner --save
```

## Usage

```js
var runner = require('base-runner');
```

## API

### [create](index.js#L37)

Create a Runner application using the given `Base` constructor and `config`.

**Params**

* `Base` **{Function}**: constructor function
* `config` **{Object}**
* `returns` **{Function}**

**Example**

```js
var create = require('base-runner');
var Runner = create(Generate, {
  parent: 'Generate',
  child: 'Generator',
  appname: 'generate',
  method: 'generator',
  plural: 'generators',
  configfile: 'generate.js',
  initFn: function () {
    this.isGenerate = true;
    this.isGenerator = false;
  },
  inspectFn: function (obj) {
    obj.isGenerate = this.isGenerate;
    obj.isGenerator = this.isGenerator;
    obj.generators = this.generators;
  },
});
```

### [Runner](index.js#L69)

Create an instance of Runner with the given `options`, and optionally a `parent` instance and `fn` to be invoked (for example, `fn` would be an updater or generator).

**Params**

* `options` **{Object}**
* `parent` **{Object}**
* `fn` **{Function}**

**Example**

```js
var create = require('base-runner');
var Runner = create(Generate, {...});
var app = new Runner();
```

### [.build](index.js#L199)

Run task(s) or applications and their task(s), calling the `callback` function when the tasks are complete.

**Params**

* `tasks` **{String|Array|Object}**
* `cb` **{Function}**
* `returns` **{Object}**: returns the instance for chaining

**Example**

```js
// run tasks
app.task('foo', function() {});
app.build(['foo'], function(err) {
  // foo is complete!
});

// run generators and their tasks
app.register('one', function(one) {
  one.task('foo', function() {});
  one.task('bar', function() {});
});
app.build('one', function(err) {
  // one is complete!
});

// run a specific generator-task
app.register('one', function(one) {
  one.task('foo', function() {});
  one.task('bar', function() {});
});
app.build('one:bar', function(err) {
  // one:bar is complete!
});
```

### [.depth](index.js#L301)

Get the depth of the current instance. This provides a quick insight into how many levels of nesting there are between the `base` instance and the current application.

**Params**

* **{getter}**: Getter only
* `returns` **{Number}**

**Example**

```js
console.log(this.depth);
//= 1
```

### [.base](index.js#L319)

Gets the `base` instance, which is the first instance created.

**Params**

* **{getter}**: Getter only
* `returns` **{Object}**: The `base` instance

**Example**

```js
var base = this.base;
```

## Related projects

[base-methods](https://www.npmjs.com/package/base-methods): Starter for creating a node.js application with a handful of common methods, like `set`, `get`,… [more](https://www.npmjs.com/package/base-methods) | [homepage](https://github.com/jonschlinkert/base-methods)

## About

### What is this?

This is a plugin for [base-methods][] that registers, resolves, and orchestrates multiple application instances, from modules that are installed anywhere on your setup, locally or globally.

### What can I do with this?

**project generator**

Create your own project generator, like [yeoman][]. This plugin can easily:

* find, resolve and register generators using glob patterns (can be locally or globally installed npm modules)
* initialize each one, passing the correct "parent" module as its invocation context
* register (get and set) tasks on each generator
* run the generators and their tasks programmaticaly or via the command line

_(TBC)_

## Running tests

Install dev dependencies:

```sh
$ npm i -d && npm test
```

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](/new).

## Author

**Jon Schlinkert**

+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License

Copyright © 2015 Jon Schlinkert
Released under the MIT license.

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on November 19, 2015._