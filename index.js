'use strict';

/**
 * > Gulp plugin for [node-sass](https://github.com/sass/node-sass) со стероидами. The project is a revised version of [gulp-sass](https://github.com/dlmanning/gulp-sass) and updated [gulp-sass-extended](https://github.com/dutchenkoOleg/gulp-sass-extended), which is no longer supported
 * @module
 * @author Oleg Dutchenko <dutchenko.o.dev@gmail.com>
 * @version 1.1.0
 */

// ----------------------------------------
// Imports
// ----------------------------------------

// modules
const sass = require('node-sass');
const through2 = require('through2');
const PluginError = require('plugin-error');
const notSupportedFile = require('gulp-not-supported-file');

// data
const pkg = require('./package.json');

// utils
const setupOptions = require('./utils/setup-options');
const pushFile = require('./utils/push-file');
const errorHandler = require('./utils/error-hadler');

// ----------------------------------------
// Private
// ----------------------------------------

/**
 * Create new plugin error
 * @const {Function}
 * @param {Object} data
 * @param {Object} [options={}]
 * @return {PluginError}
 * @private
 * @sourceCode
 */
const pluginError = (data, options) => new PluginError(pkg.name, data, options);

// ----------------------------------------
// Public
// ----------------------------------------

/**
 * Core plugin method
 * @param {Object} [opts={}] - user options
 * @param {boolean} [sync=false]
 * @returns {DestroyableTransform}
 * @sourceCode
 */
function gulpSassMonster (opts = {}, sync = false) {
	/**
	 * Read buffer and transform
	 * @param {Buffer} file
	 * @param {...*} args
	 */
	function readBuffer (file, ...args) {
		let cb = args[1];
		let notSupported = notSupportedFile(file, pluginError, {
			silent: true
		});

		if (Array.isArray(notSupported)) {
			let status = notSupported.shift();
			if (status === 'isEmpty') {
				file.extname = '.css';
				return cb(null, file);
			}
			return cb(notSupported[0], notSupported[1]);
		}

		// get render options;
		const options = setupOptions(opts, file);

		if (sync) {
			try {
				let result = sass.renderSync(options);
				pushFile(file, result, options, cb);
			} catch (error) {
				return cb(errorHandler(error, file));
			}
		} else {
			sass.render(options, (error, result) => {
				if (error) {
					error = errorHandler(error, file);
					return cb(error);
				}
				pushFile(file, result, options, cb);
			});
		}
	}

	return through2.obj(readBuffer);
}

/**
 * Plugin name
 * @type {string}
 * @sourceCode
 */
gulpSassMonster.pluginName = pkg.name;

/**
 * Plugin name
 * @type {string}
 * @sourceCode
 */
gulpSassMonster.logError = function (error) {
	let message = pluginError(error.message).toString();
	process.stderr.write(message + '\n');
	this.emit('end');
};

// ----------------------------------------
// Exports
// ----------------------------------------

module.exports = gulpSassMonster;
