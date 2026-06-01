import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getConfigDir, resolveConfigPath } from './config/config-path';
import { getUserInfo, setUserInfo } from './config/user-info-store';
import type { UserInfo } from './types';
import pkg from '../package.json';

interface CliIo {
	stdout: (message: string) => void;
	stderr: (message: string) => void;
}

interface ParsedArgs {
	args: string[];
	json: boolean;
	help: boolean;
	version: boolean;
	port?: number;
}

interface JsonFileStatus {
	path: string;
	exists: boolean;
	status: 'ok' | 'missing' | 'invalid';
	error?: string;
}

const defaultIo: CliIo = {
	stdout: message => console.log(message),
	stderr: message => console.error(message),
};

const resolveRealPath = (filePath: string): string => {
	try {
		return fs.realpathSync.native(filePath);
	} catch {
		return path.resolve(filePath);
	}
};

const parsePort = (value: string | undefined): number => {
	if (value === undefined || value === '') {
		throw new Error('Missing value for --port');
	}
	if (!/^\d+$/.test(value)) {
		throw new Error(`Invalid port: ${value}`);
	}
	const port = Number(value);
	if (!Number.isInteger(port) || port < 0 || port > 65535) {
		throw new Error(`Invalid port: ${value}`);
	}
	return port;
};

const parseArgs = (argv: string[]): ParsedArgs => {
	const args = [...argv];
	const parsed: ParsedArgs = {
		args: [],
		json: false,
		help: false,
		version: false,
	};

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];
		if (arg === '--json') {
			parsed.json = true;
			continue;
		}
		if (arg === '--help' || arg === '-h') {
			parsed.help = true;
			continue;
		}
		if (arg === '--version' || arg === '-v') {
			parsed.version = true;
			continue;
		}
		if (arg === '--port' || arg === '-p') {
			parsed.port = parsePort(args[index + 1]);
			index += 1;
			continue;
		}
		if (arg.startsWith('--port=')) {
			parsed.port = parsePort(arg.slice('--port='.length));
			continue;
		}
		parsed.args.push(arg);
	}

	return parsed;
};

const printJson = (io: CliIo, payload: unknown) => {
	io.stdout(JSON.stringify(payload, null, 2));
};

const printError = (io: CliIo, json: boolean, code: string, message: string): number => {
	if (json) {
		io.stderr(JSON.stringify({ ok: false, error: { code, message } }));
	} else {
		io.stderr(`Error: ${message}`);
	}
	return 1;
};

const helpText = () => `QQ Music API CLI

Usage:
  qq-music-api [serve] [--port <port>] [--json]
  qq-music-api config path [--json]
  qq-music-api config doctor [--json]
  qq-music-api doctor [--json]
  qq-music-api auth status [--json]
  qq-music-api auth clear [--json]

Options:
  --json             Output stable machine-readable JSON for supported commands.
  --port, -p <port>  Port for the serve command.
  --version, -v      Print package version.
  --help, -h         Show this help.

Notes:
  Running qq-music-api with no command keeps the legacy behavior and starts the HTTP service.
  Auth commands never print the full Cookie value.
`;

const getPathPayload = () => {
	const configDir = getConfigDir();
	return {
		ok: true,
		command: 'config path',
		configDir,
		serviceConfigPath: resolveConfigPath('service-config.json'),
		userInfoPath: resolveConfigPath('user-info.json'),
	};
};

const readJsonFileStatus = (filePath: string): JsonFileStatus => {
	if (!fs.existsSync(filePath)) {
		return { path: filePath, exists: false, status: 'missing' };
	}

	try {
		JSON.parse(fs.readFileSync(filePath, 'utf-8'));
		return { path: filePath, exists: true, status: 'ok' };
	} catch (error) {
		return {
			path: filePath,
			exists: true,
			status: 'invalid',
			error: error instanceof Error ? error.message : 'Invalid JSON',
		};
	}
};

const getCookieKeys = (cookie: string | undefined): string[] => {
	if (!cookie) return [];
	return cookie
		.split(';')
		.map(item => item.trim())
		.filter(Boolean)
		.map(item => item.slice(0, item.indexOf('=')).trim())
		.filter(Boolean);
};

const checkWritable = (configDir: string) => {
	try {
		fs.mkdirSync(configDir, { recursive: true });
		const probePath = path.join(configDir, `.doctor-${process.pid}-${Date.now()}.tmp`);
		fs.writeFileSync(probePath, 'ok', 'utf-8');
		fs.rmSync(probePath, { force: true });
		return { writable: true };
	} catch (error) {
		return {
			writable: false,
			error: error instanceof Error ? error.message : 'Config directory is not writable',
		};
	}
};

const getDoctorPayload = () => {
	const configDir = getConfigDir();
	const writable = checkWritable(configDir);
	const serviceConfig = readJsonFileStatus(resolveConfigPath('service-config.json'));
	const userInfo = readJsonFileStatus(resolveConfigPath('user-info.json'));
	const hasInvalidJson = serviceConfig.status === 'invalid' || userInfo.status === 'invalid';

	return {
		ok: writable.writable && !hasInvalidJson,
		command: 'config doctor',
		configDir,
		platform: os.platform(),
		nodeVersion: process.version,
		writable,
		serviceConfig,
		userInfo,
	};
};

const getAuthStatusPayload = () => {
	const userInfo = getUserInfo();
	const cookieKeys = getCookieKeys(userInfo.cookie);

	return {
		ok: true,
		command: 'auth status',
		authenticated: Boolean(userInfo.cookie && (userInfo.uin || userInfo.loginUin)),
		uin: userInfo.uin || userInfo.loginUin || '',
		hasCookie: Boolean(userInfo.cookie),
		cookieKeys,
		cookieCount: cookieKeys.length,
	};
};

const emptyUserInfo = (): UserInfo => ({
	loginUin: '',
	uin: '',
	cookie: '',
	cookieList: [],
	cookieObject: {},
	refreshData: () => ({}),
});

const clearAuth = () => {
	const configDir = getConfigDir();
	const userInfoPath = resolveConfigPath('user-info.json');
	fs.mkdirSync(configDir, { recursive: true });
	fs.writeFileSync(userInfoPath, `${JSON.stringify({ loginUin: '', cookie: '' }, null, 2)}\n`, 'utf-8');
	setUserInfo(emptyUserInfo());

	return {
		ok: true,
		command: 'auth clear',
		cleared: true,
		userInfoPath,
	};
};

const printHumanPath = (io: CliIo) => {
	const payload = getPathPayload();
	io.stdout(`Config directory: ${payload.configDir}`);
	io.stdout(`Service config:    ${payload.serviceConfigPath}`);
	io.stdout(`User info:         ${payload.userInfoPath}`);
};

const printHumanDoctor = (io: CliIo) => {
	const payload = getDoctorPayload();
	io.stdout(`Config directory: ${payload.configDir}`);
	io.stdout(`Writable:         ${payload.writable.writable ? 'yes' : 'no'}`);
	io.stdout(`service-config:   ${payload.serviceConfig.status}`);
	io.stdout(`user-info:        ${payload.userInfo.status}`);
	io.stdout(`Overall:          ${payload.ok ? 'ok' : 'needs attention'}`);
};

const printHumanAuthStatus = (io: CliIo) => {
	const payload = getAuthStatusPayload();
	io.stdout(`Authenticated: ${payload.authenticated ? 'yes' : 'no'}`);
	io.stdout(`UIN:           ${payload.uin || 'missing'}`);
	io.stdout(`Cookie:        ${payload.hasCookie ? 'present' : 'missing'}`);
	io.stdout(`Cookie keys:   ${payload.cookieKeys.length ? payload.cookieKeys.join(', ') : 'none'}`);
};

export const runCli = async (argv: string[] = process.argv.slice(2), io: CliIo = defaultIo): Promise<number> => {
	let parsed: ParsedArgs;
	try {
		parsed = parseArgs(argv);
	} catch (error) {
		return printError(io, argv.includes('--json'), 'INVALID_ARGS', error instanceof Error ? error.message : 'Invalid arguments');
	}

	const [command = 'serve', subcommand] = parsed.args;

	if (parsed.version) {
		io.stdout(pkg.version);
		return 0;
	}

	if (parsed.help) {
		io.stdout(helpText());
		return 0;
	}

	try {
		if (command === 'serve') {
			const { startServer } = await import('./server');
			startServer({ port: parsed.port, json: parsed.json });
			return 0;
		}

		if (command === 'config' && subcommand === 'path') {
			if (parsed.json) printJson(io, getPathPayload());
			else printHumanPath(io);
			return 0;
		}

		if ((command === 'config' && subcommand === 'doctor') || command === 'doctor') {
			if (parsed.json) printJson(io, getDoctorPayload());
			else printHumanDoctor(io);
			return 0;
		}

		if (command === 'auth' && subcommand === 'status') {
			if (parsed.json) printJson(io, getAuthStatusPayload());
			else printHumanAuthStatus(io);
			return 0;
		}

		if (command === 'auth' && subcommand === 'clear') {
			const payload = clearAuth();
			if (parsed.json) printJson(io, payload);
			else io.stdout(`Cleared auth state at ${payload.userInfoPath}`);
			return 0;
		}

		return printError(io, parsed.json, 'UNKNOWN_COMMAND', `Unknown command: ${parsed.args.join(' ') || command}`);
	} catch (error) {
		return printError(io, parsed.json, 'COMMAND_FAILED', error instanceof Error ? error.message : 'Command failed');
	}
};

const entryFile = process.argv[1] ? resolveRealPath(process.argv[1]) : '';
const currentFile = resolveRealPath(fileURLToPath(import.meta.url));
if (entryFile === currentFile) {
	void runCli().then(exitCode => {
		process.exitCode = exitCode;
	});
}
