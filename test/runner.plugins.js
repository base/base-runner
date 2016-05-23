'use strict';

require('mocha');
var path = require('path');
var assert = require('assert');
var argv = require('minimist')(process.argv.slice(2));
var Base = require('./support');

var runner = require('..');
var fixtures = path.resolve.bind(path, __dirname, 'fixtures');
var config = {
  name: 'foo',
  cwd: fixtures(),
  runner: require(fixtures('package.json')),
  processTitle: 'foo',
  moduleName: 'foo',
  extensions: {
    '.js': null
  }
};

runner(Base, config, argv, function(err, app, runnerContext) {
  if (err) return console.error(err);

  describe('runner plugins', function() {
    describe('app.pkg', function() {
      it('should expose an app.pkg object', function() {
        assert.equal(typeof app.pkg, 'object');
      });

      it('should expose an app.pkg.get method', function() {
        assert.equal(app.pkg.get('name'), 'base-runner-tests');
      });
    });

    describe('app.project', function() {
      it('should expose an app.project getter/setter', function() {
        assert.equal(typeof app.project, 'string');
      });

      it('should get the project name', function() {
        assert.equal(app.project, 'base-runner-tests');
      });
    });

    describe('app.cwd', function() {
      it('should expose an app.cwd getter/setter', function() {
        assert.equal(typeof app.cwd, 'string');
      });

      it('should get the working directory', function() {
        assert.equal(app.cwd, path.resolve(process.cwd(), 'test/fixtures'));
      });
    });
  });
});
