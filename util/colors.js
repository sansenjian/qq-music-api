const chalk = require('chalk');

const colors = {
	silly: text => chalk.hex('#ff69b4')(text),
	input: text => chalk.grey(text),
	verbose: text => chalk.cyan(text),
	prompt: text => chalk.white(text),
	info: text => chalk.green(text),
	data: text => chalk.grey(text),
	help: text => chalk.cyan(text),
	warn: text => chalk.yellow(text),
	debug: text => chalk.blue(text),
	error: text => chalk.red(text),
};

module.exports = colors;
