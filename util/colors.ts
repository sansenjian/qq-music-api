import chalk from 'chalk';

type ColorFunction = (text: string) => string;

interface Colors {
	silly: ColorFunction;
	input: ColorFunction;
	verbose: ColorFunction;
	prompt: ColorFunction;
	info: ColorFunction;
	data: ColorFunction;
	help: ColorFunction;
	warn: ColorFunction;
	debug: ColorFunction;
	error: ColorFunction;
}

const colors: Colors = {
	silly: (text: string) => chalk.hex('#ff69b4')(text),
	input: (text: string) => chalk.grey(text),
	verbose: (text: string) => chalk.cyan(text),
	prompt: (text: string) => chalk.white(text),
	info: (text: string) => chalk.green(text),
	data: (text: string) => chalk.grey(text),
	help: (text: string) => chalk.cyan(text),
	warn: (text: string) => chalk.yellow(text),
	debug: (text: string) => chalk.blue(text),
	error: (text: string) => chalk.red(text)
};

export default colors;
