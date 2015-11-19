
var names = {
  Generate: 'ctor name',
  generate: 'npm module to require',
  generator: 'appname (singular)',
  generators: 'appname (plural)',
  'generate.js': 'config file'
};

var names = {
  update: 'npm module to require',
  updater: '',
  updaters: '',
  Update: '',
  'updatefile.js': ''
};


var env = {
  options: {
    title: '', // process.title
    search: {
      paths: [],
      extensions: [],
      patterns: []
    },
    config: {
      file: 'generate.js',
      aliasFn: function() {
      }
    },
    module: {
      pattern: 'generate-*',
      prefix: 'generate-'
    },
  },
  defaults: {
    // defaults stored in user-home
    config: {
      file: 'generate.js',
      path: '~/my-defaults/generate.js',
      dir: '~/my-defaults',
      pkg: {}
    },
    // globally install `generate` module
    module: {
      name: 'generate',
      path: '@/generate/index.js',
      dir: '@/generate',
      pkg: {}
    }
  },
  local: {
    cwd: cwd,
    config: {
      file: 'generate.js',
      path: 'my-project/generate.js',
      dir: 'my-project',
      pkg: {}
    },
    module: {
      name: 'generate',
      path: 'my-project/node_modules/generate/index.js',
      dir: 'my-project/node_modules/generate',
      pkg: {}
    }
  },
  generators: {
    foo: {
      requires: preload,
      config: {
        name: 'generate-foo',
        alias: 'foo',
        file: 'generate.js',
        path: 'node_modules/generate-foo/generate.js',
        dir: 'node_modules/generate-foo',
        pkg: {}
      },
      module: {
        name: 'generate',
        path: 'node_modules/generate-foo/node_modules/generate/index.js',
        dir: 'node_modules/generate-foo/node_modules/generate',
        pkg: {}
      }
    },
    bar: {
      requires: preload,
      config: {
        name: 'generate-bar',
        alias: 'bar',
        file: 'generate.js',
        path: '@/generate-bar/generate.js',
        dir: '@/generate-bar',
        pkg: {}
      },
      module: {
        name: 'generate',
        path: '@/generate-bar/node_modules/generate/index.js',
        dir: '@/generate-bar/node_modules/generate',
        pkg: {}
      }
    }
  }
};
