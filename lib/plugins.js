'use strict';

var plugins = require('lazy-cache')(require);
var fn = require;
require = plugins;

/**
 * Lazily required module dependencies
 */

require('base-argv', 'argv');
require('base-option', 'option');
require('base-config', 'config');
require('base-cli', 'cli');
require('base-cwd', 'cwd');
require('base-pkg', 'pkg');
require('base-project', 'project');
require('base-store', 'store');
require = fn;

/**
 * Expose `plugins`
 */

module.exports = plugins;
