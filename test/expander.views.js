'use strict';

require('mocha');
var path = require('path');
var assert = require('assert');
var assemble = require('assemble-core');
var generators = require('base-generators');
var Base = require('base');
var base;

var runner = require('..');

describe('.field.views', function() {
  beforeEach(function() {
    base = assemble();
    base.use(generators());
    base.use(runner());
  });

  it('should add views to an existing collection', function(cb) {
    base.create('pages');

    base.option('views', {
      pages: {
        foo: {content: 'this is foo'},
        bar: {content: 'this is bar'},
        baz: {content: 'this is baz'}
      }
    });

    base.runner('foo.js', function(err, argv, app) {
      assert(!err);

      assert(app.views.hasOwnProperty('pages'));
      assert(app.views.pages.hasOwnProperty('foo'));
      assert(app.views.pages.hasOwnProperty('bar'));
      assert(app.views.pages.hasOwnProperty('baz'));
      cb();
    });
  });

  it('should add views to a new collection', function(cb) {
    base.option('views', {
      posts: {
        foo: {content: 'this is foo'},
        bar: {content: 'this is bar'},
        baz: {content: 'this is baz'}
      }
    });

    base.runner('foo.js', function(err, argv, app) {
      assert(!err);

      assert(app.views.hasOwnProperty('posts'));
      assert(app.views.posts.hasOwnProperty('foo'));
      assert(app.views.posts.hasOwnProperty('bar'));
      assert(app.views.posts.hasOwnProperty('baz'));
      cb();
    });
  });

  it('should add views from a glob', function(cb) {
    base.option('views', {
      posts: 'test/fixtures/templates/*.txt'
    });

    base.option('renameKey', function(key, view) {
      return view ? view.basename : path.basename(key);
    });

    base.runner('foo.js', function(err, argv, app) {
      assert(!err);

      assert(app.views.hasOwnProperty('posts'));
      assert(app.views.posts.hasOwnProperty('a.txt'));
      assert(app.views.posts.hasOwnProperty('b.txt'));
      cb();
    });
  });

  it('should add views from an array of globs', function(cb) {
    base.option('views', {
      posts: ['test/fixtures/templates/*.txt']
    });

    base.option('renameKey', function(key, view) {
      return view ? view.basename : path.basename(key);
    });

    base.runner('foo.js', function(err, argv, app) {
      assert(!err);

      assert(app.views.hasOwnProperty('posts'));
      assert(app.views.posts.hasOwnProperty('a.txt'));
      assert(app.views.posts.hasOwnProperty('b.txt'));
      cb();
    });
  });
});
