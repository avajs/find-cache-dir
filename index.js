'use strict';
const path = require('path');
const fs = require('fs');
const commonDir = require('commondir');
const pkgDir = require('pkg-dir');
const makeDir = require('make-dir');

const MODULES_DIRECTORIES_NAMES = ['node_modules', '.yarn'];
const {env, cwd} = process;

const isWritable = path => {
	try {
		fs.accessSync(path, fs.constants.W_OK);
		return true;
	} catch (_) {
		return false;
	}
};

function useDirectory(directory, options) {
	if (options.create) {
		makeDir.sync(directory);
	}

	if (options.thunk) {
		return (...arguments_) => path.join(directory, ...arguments_);
	}

	return directory;
}

function getModulesDirectory(directory, modulesDirectoryPath) {
	const modulesDirectory = path.join(directory, modulesDirectoryPath);

	if (
		!isWritable(modulesDirectory) &&
		(fs.existsSync(modulesDirectory) || !isWritable(path.join(directory)))
	) {
		return;
	}

	return modulesDirectory;
}

module.exports = (options = {}) => {
	if (env.CACHE_DIR && !['true', 'false', '1', '0'].includes(env.CACHE_DIR)) {
		return useDirectory(path.join(env.CACHE_DIR, 'find-cache-dir'), options);
	}

	let {cwd: directory = cwd()} = options;

	if (options.files) {
		directory = commonDir(directory, options.files);
	}

	directory = pkgDir.sync(directory);

	if (!directory) {
		return;
	}

	for (const modulesDirectoryName of MODULES_DIRECTORIES_NAMES) {
		const modulesDirectory = getModulesDirectory(directory, modulesDirectoryName);

		if (modulesDirectory) {
			return useDirectory(path.join(modulesDirectory, '.cache', options.name), options);
		}
	}
};
