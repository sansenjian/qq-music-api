import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { access } from 'node:fs/promises';
import { join } from 'node:path';
import { parseJsonRpcResponse } from './smoke-mcp-explorer-utils';

interface McpTool {
	name: string;
}

interface McpToolCallResult {
	isError?: boolean;
	content?: unknown[];
	structuredContent?: {
		ok?: boolean;
		data?: unknown;
		error?: {
			code?: string;
			message?: string;
		};
		metadata?: Record<string, unknown>;
	};
}

interface McpResource {
	uri: string;
}

type PendingRequest = {
	resolve: (value: unknown) => void;
	reject: (error: Error) => void;
	timer: NodeJS.Timeout;
};

const root = process.cwd();
const port = Number.parseInt(process.env.SMOKE_E2E_PORT ?? '43213', 10);
const baseUrl = `http://127.0.0.1:${port}`;
const timeoutMs = 10_000;

const assert = (condition: unknown, message: string): asserts condition => {
	if (!condition) {
		throw new Error(message);
	}
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const readStream = (stream: NodeJS.ReadableStream): (() => string) => {
	let output = '';
	stream.on('data', chunk => {
		output += chunk.toString('utf8');
	});
	return () => output;
};

const fetchWithTimeout = (url: string, init: RequestInit = {}) =>
	fetch(url, {
		...init,
		signal: init.signal ?? AbortSignal.timeout(timeoutMs),
	});

const fetchText = async (path: string) => {
	const response = await fetchWithTimeout(`${baseUrl}${path}`);
	const text = await response.text();
	return { response, text };
};

const fetchJson = async <T = unknown>(path: string) => {
	const { response, text } = await fetchText(path);
	let json: T;
	try {
		json = JSON.parse(text) as T;
	} catch (error) {
		throw new Error(
			`Expected JSON from ${path}, got ${response.status}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
	return { response, json };
};

const waitForHttpServer = async (server: ChildProcessWithoutNullStreams, getLogs: () => string) => {
	for (let attempt = 0; attempt < 40; attempt += 1) {
		if (server.exitCode !== null) {
			throw new Error(`HTTP server exited early with code ${server.exitCode}.\n${getLogs()}`);
		}

		try {
			const { response } = await fetchJson('/explorer/metadata');
			if (response.ok) {
				return;
			}
		} catch {}

		await delay(250);
	}

	throw new Error(`HTTP server did not become ready on ${baseUrl}.\n${getLogs()}`);
};

class JsonRpcStdioClient {
	private buffer = '';
	private nextId = 1;
	private readonly pending = new Map<number, PendingRequest>();
	private readonly getStderr: () => string;

	constructor(private readonly child: ChildProcessWithoutNullStreams) {
		this.getStderr = readStream(child.stderr);
		child.stdout.on('data', chunk => this.onStdout(chunk.toString('utf8')));
		child.on('exit', code => {
			if (this.pending.size === 0) {
				return;
			}

			const error = new Error(`MCP process exited early with code ${code}.\n${this.getStderr()}`);
			for (const pending of this.pending.values()) {
				clearTimeout(pending.timer);
				pending.reject(error);
			}
			this.pending.clear();
		});
	}

	request<T = unknown>(method: string, params: Record<string, unknown> = {}): Promise<T> {
		const id = this.nextId;
		this.nextId += 1;

		return new Promise<T>((resolve, reject) => {
			const timer = setTimeout(() => {
				this.pending.delete(id);
				reject(new Error(`Timed out waiting for MCP ${method}.\n${this.getStderr()}`));
			}, timeoutMs);

			this.pending.set(id, {
				resolve: value => resolve(value as T),
				reject,
				timer,
			});

			this.child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`);
		});
	}

	notify(method: string, params: Record<string, unknown> = {}) {
		this.child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method, params })}\n`);
	}

	close() {
		this.child.stdin.end();
		if (!this.child.killed) {
			this.child.kill();
		}
	}

	private onStdout(chunk: string) {
		this.buffer += chunk;

		while (true) {
			const newlineIndex = this.buffer.indexOf('\n');
			if (newlineIndex === -1) {
				return;
			}

			const line = this.buffer.slice(0, newlineIndex).trim();
			this.buffer = this.buffer.slice(newlineIndex + 1);
			if (!line) {
				continue;
			}

			const response = parseJsonRpcResponse(line);
			if (response === undefined) continue;
			const pending = this.pending.get(response.id);
			if (!pending) {
				continue;
			}

			this.pending.delete(response.id);
			clearTimeout(pending.timer);

			if (response.error) {
				pending.reject(new Error(`MCP ${response.error.code}: ${response.error.message}`));
				continue;
			}

			pending.resolve(response.result);
		}
	}
}

const assertBuiltArtifactsExist = async () => {
	await access(join(root, 'dist', 'app.js'));
	await access(join(root, 'packages', 'mcp', 'dist', 'cli.js'));
};

const runExplorerSmoke = async () => {
	const server = spawn(process.execPath, ['dist/app.js'], {
		cwd: root,
		env: {
			...process.env,
			PORT: String(port),
		},
		stdio: ['ignore', 'pipe', 'pipe'],
	});
	const getLogs = readStream(server.stdout);
	const getErrors = readStream(server.stderr);

	try {
		await waitForHttpServer(server, () => `${getLogs()}\n${getErrors()}`);

		const home = await fetchText('/index.html');
		assert(home.response.status === 200, `Home page returned ${home.response.status}`);
		assert(home.text.includes('/explorer?api=getSearchByKey'), 'Home page does not link to Explorer deep links');
		assert(home.text.includes('/explorer?api=getImageUrl'), 'Home page does not link to the image URL Explorer entry');
		assert(!home.text.includes('request-builder'), 'Home page still contains the old request builder');
		assert(!home.text.includes('playground-utils.js'), 'Home page still imports playground utilities');

		const explorerRedirect = await fetchWithTimeout(`${baseUrl}/explorer?api=getImageUrl&id=abc`, {
			redirect: 'manual',
		});
		assert(explorerRedirect.status === 302, `Explorer redirect returned ${explorerRedirect.status}`);
		assert(
			explorerRedirect.headers.get('location') === '/explorer/index.html?api=getImageUrl&id=abc',
			'Explorer redirect did not preserve deep-link query params',
		);

		const metadata = await fetchJson<{
			title?: string;
			endpoints?: Array<{ name?: string; path?: string; queryParams?: Array<{ name: string; required?: boolean }> }>;
		}>('/explorer/metadata');
		assert(metadata.response.status === 200, `Explorer metadata returned ${metadata.response.status}`);
		assert(metadata.json.title === 'QQ Music API Explorer', 'Explorer metadata title mismatch');
		assert((metadata.json.endpoints?.length ?? 0) >= 60, 'Explorer metadata endpoint count is too low');
		assert(
			metadata.json.endpoints?.some(
				endpoint =>
					endpoint.name === 'getImageUrl' && endpoint.queryParams?.some(param => param.name === 'id' && param.required),
			),
			'Explorer metadata is missing getImageUrl required id param',
		);

		const html = await fetchText('/explorer/index.html');
		assert(html.response.status === 200, `Explorer HTML returned ${html.response.status}`);
		assert(
			html.text.includes('href="/explorer/metadata"'),
			'Explorer Metadata link does not target /explorer/metadata',
		);
		assert(
			html.text.includes('data-metadata-path="/explorer/metadata"'),
			'Explorer app script does not receive the metadata path',
		);
		assert(!html.text.includes('__API_EXPLORER_METADATA_PATH__'), 'Explorer metadata placeholder leaked into HTML');

		const imageResponse = await fetchJson<{
			response?: {
				code?: number;
				data?: {
					imageUrl?: string;
				};
			};
		}>('/getImageUrl?id=000MkMni19ClKG&size=300x300');
		assert(imageResponse.response.status === 200, `getImageUrl returned ${imageResponse.response.status}`);
		assert(imageResponse.json.response?.code === 0, 'getImageUrl response code mismatch');
		assert(
			imageResponse.json.response.data?.imageUrl?.includes('T002R300x300M000000MkMni19ClKG.jpg'),
			'getImageUrl response did not include the expected image URL',
		);

		console.log('OK Explorer HTTP smoke');
	} finally {
		server.kill();
	}
};

const runMcpSmoke = async () => {
	const child = spawn(process.execPath, ['packages/mcp/dist/cli.js'], {
		cwd: root,
		stdio: ['pipe', 'pipe', 'pipe'],
	});
	const client = new JsonRpcStdioClient(child);

	try {
		const init = await client.request<{ serverInfo?: { name?: string; version?: string } }>('initialize', {
			protocolVersion: '2025-03-26',
			capabilities: {},
			clientInfo: {
				name: 'qq-music-api-e2e-smoke',
				version: '0.0.0',
			},
		});
		assert(init.serverInfo?.name === 'qq-music-api-mcp-server', 'MCP server name mismatch');

		client.notify('notifications/initialized');

		const tools = await client.request<{ tools?: McpTool[] }>('tools/list');
		const toolNames = new Set((tools.tools ?? []).map(tool => tool.name));
		for (const name of ['qq_music_list_apis', 'qq_music_call_api', 'qq_music_get_hot_keys']) {
			assert(toolNames.has(name), `MCP tools/list missing ${name}`);
		}

		const resources = await client.request<{ resources?: McpResource[] }>('resources/list');
		assert(
			(resources.resources ?? []).some(resource => resource.uri === 'qq-music://api-catalog'),
			'MCP resources/list missing api catalog resource',
		);

		const catalog = await client.request<{ contents?: Array<{ text?: string }> }>('resources/read', {
			uri: 'qq-music://api-catalog',
		});
		const catalogItems = JSON.parse(catalog.contents?.[0]?.text ?? '[]') as Array<{ name?: string }>;
		assert(
			catalogItems.some(item => item.name === 'getSearchByKey'),
			'MCP catalog resource missing getSearchByKey',
		);

		const listApis = await client.request<McpToolCallResult>('tools/call', {
			name: 'qq_music_list_apis',
			arguments: {
				category: 'search',
				limit: 5,
				response_format: 'json',
			},
		});
		assert(listApis.structuredContent?.ok === true, 'qq_music_list_apis did not return ok structured content');

		const unknownApi = await client.request<McpToolCallResult>('tools/call', {
			name: 'qq_music_call_api',
			arguments: {
				name: 'nonexistentApi',
				params: {},
				response_format: 'json',
			},
		});
		assert(unknownApi.isError === true, 'qq_music_call_api unknown API did not return a tool error');
		assert(
			unknownApi.structuredContent?.error?.code === 'API_NOT_FOUND',
			'qq_music_call_api unknown API error code mismatch',
		);
		assert(
			unknownApi.structuredContent.metadata?.listTool === 'qq_music_list_apis',
			'qq_music_call_api unknown API error did not include the list tool hint',
		);

		console.log(`OK MCP stdio smoke: tools=${tools.tools?.length ?? 0}; resources=${resources.resources?.length ?? 0}`);
	} finally {
		client.close();
	}
};

await assertBuiltArtifactsExist();
await runExplorerSmoke();
await runMcpSmoke();
