import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import pkg from '../package.json';
import { runMcpServer } from './server';

const restoreConsoleOutputToStderr = (): (() => void) => {
	const originalLog = console.log;
	const originalInfo = console.info;
	const originalWarn = console.warn;
	const originalDebug = console.debug;
	const stderrLog = (...args: unknown[]) => {
		console.error(...args);
	};

	console.log = stderrLog;
	console.info = stderrLog;
	console.warn = stderrLog;
	console.debug = stderrLog;

	return () => {
		console.log = originalLog;
		console.info = originalInfo;
		console.warn = originalWarn;
		console.debug = originalDebug;
	};
};

const helpText = () => `QQ Music API MCP

Usage:
  qq-music-api-mcp [start]

Options:
  --version, -v  Print package version.
  --help, -h     Show this help.

MCP uses stdio; normal logs are redirected to stderr while it is running.
`;

const resolveRealPath = (filePath: string): string => {
	try {
		return fs.realpathSync.native(filePath);
	} catch {
		return resolve(filePath);
	}
};

const isEntryFile = () => {
	const entryFile = process.argv[1] ? resolveRealPath(process.argv[1]) : '';
	const currentFile = resolveRealPath(fileURLToPath(import.meta.url));
	return entryFile === currentFile;
};

export const runCli = async (argv: string[] = process.argv.slice(2)): Promise<number> => {
	const [command] = argv;

	if (command === '--help' || command === '-h') {
		console.log(helpText());
		return 0;
	}

	if (command === '--version' || command === '-v') {
		console.log(pkg.version);
		return 0;
	}

	if (command !== undefined && command !== 'start') {
		console.error(`Error: Unknown command: ${argv.join(' ')}`);
		return 1;
	}

	const restoreConsoleOutput = restoreConsoleOutputToStderr();
	const restoreOnProcessExit = () => {
		restoreConsoleOutput();
	};
	process.once('exit', restoreOnProcessExit);

	try {
		await runMcpServer();
		return 0;
	} catch (error) {
		process.off('exit', restoreOnProcessExit);
		restoreConsoleOutput();
		console.error(`Error: ${error instanceof Error ? error.message : 'MCP server failed'}`);
		return 1;
	}
};

if (isEntryFile()) {
	void runCli().then(exitCode => {
		process.exitCode = exitCode;
	});
}
