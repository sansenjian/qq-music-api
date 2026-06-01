import { exec, execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);
const projectRoot = process.cwd();
const configDir = path.join(projectRoot, 'tests', 'output', 'package-entry-config');
const outputDir = path.join(projectRoot, 'tests', 'output', 'package-entry');
const typesDir = path.join(projectRoot, 'tests', 'output', 'package-entry-types');
const tscEntry = path.join(projectRoot, 'node_modules', 'typescript', 'bin', 'tsc');

const commandOptions = {
	cwd: projectRoot,
	env: {
		...process.env,
		QQ_MUSIC_API_CONFIG_DIR: configDir,
	},
	timeout: 60_000,
};

const runBuild = async () => execAsync('npm run build', commandOptions);

const runNode = async (args: string[]) =>
	execFileAsync(process.execPath, args, {
		cwd: projectRoot,
		env: {
			...process.env,
			QQ_MUSIC_API_CONFIG_DIR: configDir,
		},
		timeout: 60_000,
	});

const runTsc = async (configPath: string) =>
	execFileAsync(process.execPath, [tscEntry, '--project', configPath, '--pretty', 'false'], {
		cwd: projectRoot,
		timeout: 60_000,
	});

const getPackageBinEntry = () => {
	const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8')) as {
		bin: Record<string, string>;
	};
	return path.join(projectRoot, packageJson.bin['qq-music-api']);
};

const writeTypesFixture = () => {
	fs.rmSync(typesDir, { recursive: true, force: true });
	fs.mkdirSync(typesDir, { recursive: true });

	fs.writeFileSync(
		path.join(typesDir, 'esm-consumer.mts'),
		[
			"import app from '@sansenjian/qq-music-api';",
			"import type Koa = require('koa');",
			'',
			'const typedApp: Koa = app;',
			'const callback: ReturnType<typeof typedApp.callback> = typedApp.callback();',
			'void callback;',
			'',
		].join('\n'),
	);
	fs.writeFileSync(
		path.join(typesDir, 'cjs-consumer.cts'),
		[
			"import app = require('@sansenjian/qq-music-api');",
			"import type Koa = require('koa');",
			'',
			'const typedApp: Koa = app;',
			'const callback: ReturnType<typeof typedApp.callback> = typedApp.callback();',
			'void callback;',
			'',
		].join('\n'),
	);
	fs.writeFileSync(
		path.join(typesDir, 'tsconfig.node16.json'),
		JSON.stringify(
			{
				compilerOptions: {
					target: 'ES2022',
					module: 'Node16',
					moduleResolution: 'Node16',
					strict: true,
					noEmit: true,
					esModuleInterop: false,
					allowSyntheticDefaultImports: false,
					ignoreDeprecations: '6.0',
					skipLibCheck: false,
					types: ['node'],
				},
				include: ['esm-consumer.mts', 'cjs-consumer.cts'],
			},
			null,
			2,
		),
	);
	fs.writeFileSync(
		path.join(typesDir, 'tsconfig.bundler.json'),
		JSON.stringify(
			{
				compilerOptions: {
					target: 'ES2022',
					module: 'ESNext',
					moduleResolution: 'Bundler',
					strict: true,
					noEmit: true,
					esModuleInterop: false,
					allowSyntheticDefaultImports: false,
					ignoreDeprecations: '6.0',
					skipLibCheck: false,
					types: ['node'],
				},
				include: ['esm-consumer.mts'],
			},
			null,
			2,
		),
	);
};

const waitForServerStart = (entry: string) =>
	new Promise<void>((resolve, reject) => {
		const child = execFile(process.execPath, [entry], {
			cwd: projectRoot,
			env: {
				...process.env,
				PORT: '0',
				QQ_MUSIC_API_CONFIG_DIR: configDir,
			},
			timeout: 60_000,
		});

		let completed = false;
		let output = '';

		const finish = (error?: Error) => {
			if (completed) return;
			completed = true;
			child.kill();
			if (error) {
				reject(error);
				return;
			}
			resolve();
		};

		const timer = setTimeout(() => {
			finish(new Error(`Timed out waiting for server start. Output:\n${output}`));
		}, 10_000);

		const collectOutput = (chunk: Buffer | string) => {
			output += chunk.toString();
			if (output.includes('server running @')) {
				clearTimeout(timer);
				finish();
			}
		};

		child.stdout?.on('data', collectOutput);
		child.stderr?.on('data', collectOutput);
		child.on('exit', code => {
			clearTimeout(timer);
			if (!completed) {
				finish(new Error(`Server process exited with code ${code}. Output:\n${output}`));
			}
		});
	});

describe('Package Entry Compatibility', () => {
	beforeAll(async () => {
		await runBuild();
	}, 60_000);

	beforeEach(() => {
		fs.rmSync(configDir, { recursive: true, force: true });
	});

	test(
		'should load the package through the ESM import entry',
		async () => {
			const { stdout } = await runNode([
				'--input-type=module',
				'--eval',
				`
					const mod = await import('@sansenjian/qq-music-api');
					if (typeof mod.default?.callback !== 'function') {
						throw new Error('Expected ESM default export to be a Koa app');
					}
					console.log('esm ok');
				`,
			]);

			expect(stdout.trim()).toBe('esm ok');
			expect(fs.existsSync(configDir)).toBe(false);
		},
		60_000,
	);

	test(
		'should load the package through the CJS require entry',
		async () => {
			const { stdout } = await runNode([
				'--eval',
				`
					const mod = require('@sansenjian/qq-music-api');
					if (typeof mod.callback !== 'function') {
						throw new Error('Expected CJS export to be a Koa app');
					}
					if (Object.prototype.hasOwnProperty.call(mod, 'default')) {
						throw new Error('Expected CJS export to work without a .default wrapper');
					}
					console.log('cjs ok');
				`,
			]);

			expect(stdout.trim()).toBe('cjs ok');
			expect(fs.existsSync(configDir)).toBe(false);
		},
		60_000,
	);

	test('should emit a node shebang on the package bin entry', () => {
		const binEntry = getPackageBinEntry();

		expect(fs.readFileSync(binEntry, 'utf8')).toMatch(/^#!\/usr\/bin\/env node\n/);
	});

	test(
		'should start the CLI when invoked through a symlinked bin path',
		async () => {
			fs.mkdirSync(outputDir, { recursive: true });
			const realEntry = getPackageBinEntry();
			const symlinkEntry = path.join(outputDir, 'qq-music-api-bin.mjs');
			fs.rmSync(symlinkEntry, { force: true });
			fs.symlinkSync(realEntry, symlinkEntry);

			await waitForServerStart(symlinkEntry);
		},
		60_000,
	);

	test('should print CLI help without starting the service', async () => {
		const { stdout } = await runNode([getPackageBinEntry(), '--help']);

		expect(stdout).toContain('qq-music-api config doctor');
		expect(stdout).toContain('qq-music-api auth status');
	});

	test('should return config paths as JSON', async () => {
		const { stdout } = await runNode([getPackageBinEntry(), 'config', 'path', '--json']);
		const payload = JSON.parse(stdout);

		expect(payload).toMatchObject({
			ok: true,
			command: 'config path',
			configDir,
			serviceConfigPath: path.join(configDir, 'service-config.json'),
			userInfoPath: path.join(configDir, 'user-info.json'),
		});
	});

	test('should reject missing CLI port values', async () => {
		await expect(runNode([getPackageBinEntry(), 'config', 'path', '--port'])).rejects.toMatchObject({
			code: 1,
			stderr: expect.stringContaining('Missing value for --port'),
		});
	});

	test('should reject partial CLI port values', async () => {
		await expect(runNode([getPackageBinEntry(), 'config', 'path', '--port=3200abc'])).rejects.toMatchObject({
			code: 1,
			stderr: expect.stringContaining('Invalid port: 3200abc'),
		});
	});

	test('should run config doctor as JSON without requiring auth', async () => {
		const { stdout } = await runNode([getPackageBinEntry(), '--json', 'doctor']);
		const payload = JSON.parse(stdout);

		expect(payload).toMatchObject({
			ok: true,
			command: 'config doctor',
			configDir,
			writable: {
				writable: true,
			},
			serviceConfig: {
				status: 'missing',
			},
			userInfo: {
				status: 'missing',
			},
		});
	});

	test('should report auth status without leaking cookie values', async () => {
		fs.mkdirSync(configDir, { recursive: true });
		fs.writeFileSync(
			path.join(configDir, 'user-info.json'),
			JSON.stringify({
				loginUin: 'o123456',
				cookie: 'uin=o123456; qqmusic_key=secret-value',
			}),
			'utf-8',
		);

		const { stdout } = await runNode([getPackageBinEntry(), 'auth', 'status', '--json']);
		const payload = JSON.parse(stdout);

		expect(payload).toMatchObject({
			ok: true,
			command: 'auth status',
			authenticated: true,
			hasCookie: true,
			cookieKeys: ['uin', 'qqmusic_key'],
		});
		expect(stdout).not.toContain('secret-value');
	});

	test('should clear auth state through the CLI', async () => {
		fs.mkdirSync(configDir, { recursive: true });
		const userInfoPath = path.join(configDir, 'user-info.json');
		fs.writeFileSync(
			userInfoPath,
			JSON.stringify({
				loginUin: 'o123456',
				cookie: 'uin=o123456; qqmusic_key=secret-value',
			}),
			'utf-8',
		);

		const { stdout } = await runNode([getPackageBinEntry(), 'auth', 'clear', '--json']);
		const payload = JSON.parse(stdout);
		const userInfo = JSON.parse(fs.readFileSync(userInfoPath, 'utf-8'));

		expect(payload).toMatchObject({
			ok: true,
			command: 'auth clear',
			cleared: true,
			userInfoPath,
		});
		expect(userInfo).toEqual({ loginUin: '', cookie: '' });
	});

	test(
		'should expose Node16-compatible types for ESM import and CJS require consumers',
		async () => {
			writeTypesFixture();

			await runTsc(path.join(typesDir, 'tsconfig.node16.json'));
		},
		60_000,
	);

	test(
		'should expose bundler-compatible types for ESM consumers',
		async () => {
			writeTypesFixture();

			await runTsc(path.join(typesDir, 'tsconfig.bundler.json'));
		},
		60_000,
	);
});
