import { exec, execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

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

const getMcpPackageBinEntry = () => {
	const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'packages', 'mcp', 'package.json'), 'utf8')) as {
		bin: Record<string, string>;
	};
	return path.join(projectRoot, 'packages', 'mcp', packageJson.bin['qq-music-api-mcp']);
};

const writeTypesFixture = () => {
	fs.rmSync(typesDir, { recursive: true, force: true });
	fs.mkdirSync(typesDir, { recursive: true });

	fs.writeFileSync(
		path.join(typesDir, 'esm-consumer.mts'),
		[
			"import app from '@sansenjian/qq-music-api';",
			"import appEntry from '@sansenjian/qq-music-api/app';",
			"import { getMusicPlay } from '@sansenjian/qq-music-api/services';",
			"import { checkQQLoginQr, getLyric, getMusicPlay as sdkGetMusicPlay, getQQLoginQr, search } from '@sansenjian/qq-music-api/sdk';",
			"import type Koa = require('koa');",
			'',
			'const typedApp: Koa = app;',
			'const typedAppEntry: Koa = appEntry;',
			'const callback: ReturnType<typeof typedApp.callback> = typedApp.callback();',
			'const appEntryCallback: ReturnType<typeof typedAppEntry.callback> = typedAppEntry.callback();',
			'const serviceResult = getMusicPlay({ params: { songmid: "003rJSwm3TechU" } });',
			'const sdkResult = search({ key: "周杰伦" });',
			'void callback;',
			'void appEntryCallback;',
			'void serviceResult;',
			'void sdkResult;',
			'void sdkGetMusicPlay;',
			'void getLyric;',
			'void getQQLoginQr;',
			'void checkQQLoginQr;',
			'',
		].join('\n'),
	);
	fs.writeFileSync(
		path.join(typesDir, 'mcp-consumer.mts'),
		[
			"import { createQqMusicMcpServer, runMcpServer } from '@sansenjian/qq-music-api-mcp';",
			"import type { QqMusicToolPayload } from '@sansenjian/qq-music-api-mcp';",
			'',
			"const payload: QqMusicToolPayload = { ok: true, tool: 'typed-mcp' };",
			'const server = createQqMusicMcpServer();',
			'void payload;',
			'void server;',
			'void runMcpServer;',
			'',
		].join('\n'),
	);
	fs.writeFileSync(
		path.join(typesDir, 'cjs-consumer.cts'),
		[
			"import app = require('@sansenjian/qq-music-api');",
			"import appEntry = require('@sansenjian/qq-music-api/app');",
			"import { getMusicPlay } from '@sansenjian/qq-music-api/services';",
			"import { checkQQLoginQr, getLyric, getMusicPlay as sdkGetMusicPlay, getQQLoginQr, search } from '@sansenjian/qq-music-api/sdk';",
			"import type Koa = require('koa');",
			'',
			'const typedApp: Koa = app;',
			'const typedAppEntry: Koa = appEntry;',
			'const callback: ReturnType<typeof typedApp.callback> = typedApp.callback();',
			'const appEntryCallback: ReturnType<typeof typedAppEntry.callback> = typedAppEntry.callback();',
			'const serviceResult = getMusicPlay({ params: { songmid: "003rJSwm3TechU" } });',
			'const sdkResult = search({ key: "周杰伦" });',
			'void callback;',
			'void appEntryCallback;',
			'void serviceResult;',
			'void sdkResult;',
			'void sdkGetMusicPlay;',
			'void getLyric;',
			'void getQQLoginQr;',
			'void checkQQLoginQr;',
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
	fs.writeFileSync(
		path.join(typesDir, 'tsconfig.mcp-node16.json'),
		JSON.stringify(
			{
				compilerOptions: {
					target: 'ES2022',
					module: 'Node16',
					moduleResolution: 'Node16',
					strict: true,
					noEmit: true,
					ignoreDeprecations: '6.0',
					skipLibCheck: true,
					types: ['node'],
				},
				include: ['mcp-consumer.mts'],
			},
			null,
			2,
		),
	);
	fs.writeFileSync(
		path.join(typesDir, 'tsconfig.mcp-bundler.json'),
		JSON.stringify(
			{
				compilerOptions: {
					target: 'ES2022',
					module: 'ESNext',
					moduleResolution: 'Bundler',
					strict: true,
					noEmit: true,
					ignoreDeprecations: '6.0',
					skipLibCheck: true,
					types: ['node'],
				},
				include: ['mcp-consumer.mts'],
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

	test(
		'should load the explicit app subpath through ESM import',
		async () => {
			const { stdout } = await runNode([
				'--input-type=module',
				'--eval',
				`
					const mod = await import('@sansenjian/qq-music-api/app');
					if (typeof mod.default?.callback !== 'function') {
						throw new Error('Expected ESM app entry to expose a Koa app');
					}
					console.log('esm app ok');
				`,
			]);

			expect(stdout.trim()).toBe('esm app ok');
			expect(fs.existsSync(configDir)).toBe(false);
		},
		60_000,
	);

	test(
		'should load the explicit app subpath through CJS require',
		async () => {
			const { stdout } = await runNode([
				'--eval',
				`
					const mod = require('@sansenjian/qq-music-api/app');
					if (typeof mod.callback !== 'function') {
						throw new Error('Expected CJS app entry to expose a Koa app');
					}
					if (Object.prototype.hasOwnProperty.call(mod, 'default')) {
						throw new Error('Expected CJS app entry to work without a .default wrapper');
					}
					console.log('cjs app ok');
				`,
			]);

			expect(stdout.trim()).toBe('cjs app ok');
			expect(fs.existsSync(configDir)).toBe(false);
		},
		60_000,
	);

	test(
		'should expose service functions through the ESM services entry',
		async () => {
			const { stdout } = await runNode([
				'--input-type=module',
				'--eval',
				`
					const mod = await import('@sansenjian/qq-music-api/services');
					if (typeof mod.getMusicPlay !== 'function' || typeof mod.getSearchByKey !== 'function') {
						throw new Error('Expected ESM services entry to expose service functions');
					}
					console.log('esm services ok');
				`,
			]);

			expect(stdout.trim()).toBe('esm services ok');
			expect(fs.existsSync(configDir)).toBe(false);
		},
		60_000,
	);

	test(
		'should expose service functions through the CJS services entry',
		async () => {
			const { stdout } = await runNode([
				'--eval',
				`
					const mod = require('@sansenjian/qq-music-api/services');
					if (typeof mod.getMusicPlay !== 'function' || typeof mod.getSearchByKey !== 'function') {
						throw new Error('Expected CJS services entry to expose service functions');
					}
					console.log('cjs services ok');
				`,
			]);

			expect(stdout.trim()).toBe('cjs services ok');
			expect(fs.existsSync(configDir)).toBe(false);
		},
		60_000,
	);

	test(
		'should expose SDK helpers through ESM and CJS sdk entries',
		async () => {
			const { stdout: esmStdout } = await runNode([
				'--input-type=module',
				'--eval',
				`
					const mod = await import('@sansenjian/qq-music-api/sdk');
					if (
						typeof mod.search !== 'function' ||
						typeof mod.getMusicPlay !== 'function' ||
						typeof mod.getLyric !== 'function' ||
						typeof mod.getQQLoginQr !== 'function' ||
						typeof mod.checkQQLoginQr !== 'function'
					) {
						throw new Error('Expected ESM sdk entry to expose helper functions');
					}
					console.log('esm sdk ok');
				`,
			]);
			const { stdout: cjsStdout } = await runNode([
				'--eval',
				`
					const mod = require('@sansenjian/qq-music-api/sdk');
					if (
						typeof mod.search !== 'function' ||
						typeof mod.getMusicPlay !== 'function' ||
						typeof mod.getLyric !== 'function' ||
						typeof mod.getQQLoginQr !== 'function' ||
						typeof mod.checkQQLoginQr !== 'function'
					) {
						throw new Error('Expected CJS sdk entry to expose helper functions');
					}
					console.log('cjs sdk ok');
				`,
			]);

			expect(esmStdout.trim()).toBe('esm sdk ok');
			expect(cjsStdout.trim()).toBe('cjs sdk ok');
			expect(fs.existsSync(configDir)).toBe(false);
		},
		60_000,
	);

	test('should emit a node shebang on the package bin entry', () => {
		const binEntry = getPackageBinEntry();

		expect(fs.readFileSync(binEntry, 'utf8')).toMatch(/^#!\/usr\/bin\/env node\n/);
	});

	test('should emit a node shebang on the MCP package bin entry', () => {
		const binEntry = getMcpPackageBinEntry();

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

	test('should start the MCP CLI when invoked through a symlinked bin path', async () => {
		fs.mkdirSync(outputDir, { recursive: true });
		const realEntry = getMcpPackageBinEntry();
		const symlinkEntry = path.join(outputDir, 'qq-music-api-mcp-bin.mjs');
		fs.rmSync(symlinkEntry, { force: true });
		fs.symlinkSync(realEntry, symlinkEntry);

		const { stdout } = await runNode([symlinkEntry, '--help']);

		expect(stdout).toContain('qq-music-api-mcp');
	});

	test('should print CLI help without starting the service', async () => {
		const { stdout } = await runNode([getPackageBinEntry(), '--help']);

		expect(stdout).toContain('qq-music-api config doctor');
		expect(stdout).toContain('qq-music-api auth status');
		expect(stdout).toContain('@sansenjian/qq-music-api-mcp');
		expect(stdout).not.toContain('qq-music-api mcp start');
	});

	test(
		'should expose MCP tools over stdio through the MCP package CLI',
		async () => {
			fs.mkdirSync(configDir, { recursive: true });
			fs.writeFileSync(path.join(configDir, 'service-config.json'), '{ invalid json', 'utf-8');

			const transport = new StdioClientTransport({
				command: process.execPath,
				args: [getMcpPackageBinEntry()],
				cwd: projectRoot,
				env: {
					...process.env,
					QQ_MUSIC_API_CONFIG_DIR: configDir,
				},
				stderr: 'pipe',
			});
			const client = new Client({
				name: 'qq-music-api-package-entry-test',
				version: '1.0.0',
			});

			try {
				await client.connect(transport);
				const tools = await client.listTools();
				const toolNames = tools.tools.map(tool => tool.name);
				const searchTool = tools.tools.find(tool => tool.name === 'qq_music_search_songs');

				expect(toolNames).toEqual(expect.arrayContaining([
					'qq_music_config_status',
					'qq_music_list_apis',
					'qq_music_search_songs',
				]));
				expect(searchTool?.inputSchema).toMatchObject({
					type: 'object',
					properties: {
						keyword: expect.any(Object),
						response_format: expect.any(Object),
					},
				});
				expect(searchTool?.inputSchema.properties).not.toHaveProperty('remoteplace');
				expect(searchTool?.outputSchema).toMatchObject({
					type: 'object',
					properties: {
						ok: expect.any(Object),
						tool: expect.any(Object),
					},
				});

				const result = await client.callTool({
					name: 'qq_music_config_status',
					arguments: { response_format: 'json' },
				});

				expect(result.structuredContent).toMatchObject({
					ok: true,
					tool: 'qq_music_config_status',
					data: {
						configDir,
						serviceConfigPath: path.join(configDir, 'service-config.json'),
						userInfoPath: path.join(configDir, 'user-info.json'),
					},
				});
			} finally {
				await client.close();
			}
		},
		60_000,
	);

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
				cookie: 'uin=o123456; malformed; qqmusic_key=secret-value',
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

	test(
		'should expose Node16-compatible types for MCP ESM consumers',
		async () => {
			writeTypesFixture();

			await runTsc(path.join(typesDir, 'tsconfig.mcp-node16.json'));
		},
		60_000,
	);

	test(
		'should expose bundler-compatible types for MCP ESM consumers',
		async () => {
			writeTypesFixture();

			await runTsc(path.join(typesDir, 'tsconfig.mcp-bundler.json'));
		},
		60_000,
	);
});
