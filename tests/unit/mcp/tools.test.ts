import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { setUserInfo } from '../../../src/config/user-info-store';
import {
	createQqMusicMcpHandlers,
	type QqMusicMcpServices,
	type QqMusicToolPayload,
} from '../../../src/mcp/tools';

const okResponse = (data: unknown) => ({
	status: 200,
	body: {
		response: data,
	},
});

const createServices = (overrides: Partial<QqMusicMcpServices> = {}): QqMusicMcpServices => ({
	getAlbumInfo: vi.fn().mockResolvedValue(okResponse({ album: 'mock' })),
	getHotKey: vi.fn().mockResolvedValue(okResponse({ hotkeys: ['test'] })),
	getSearchByKey: vi.fn().mockResolvedValue(okResponse({ songs: [{ songmid: 'abc', name: 'Mock Song' }] })),
	getTopLists: vi.fn().mockResolvedValue(okResponse({ topLists: [] })),
	songListDetail: vi.fn().mockResolvedValue(okResponse({ dissid: '123' })),
	...overrides,
});

const payloadOf = (result: CallToolResult): QqMusicToolPayload => result.structuredContent as QqMusicToolPayload;

describe('MCP tool handlers', () => {
	afterEach(() => {
		vi.clearAllMocks();
		setUserInfo({
			loginUin: '',
			uin: '',
			cookie: '',
			cookieList: [],
			cookieObject: {},
			refreshData: () => ({}),
		});
	});

	test('lists API metadata with pagination', async () => {
		const handlers = createQqMusicMcpHandlers(createServices());
		const result = await handlers.listApis({ category: 'search', limit: 2, offset: 0, response_format: 'json' });
		const payload = payloadOf(result);
		const data = payload.data as { count: number; total: number; hasMore: boolean };

		expect(payload.ok).toBe(true);
		expect(payload.tool).toBe('qq_music_list_apis');
		expect(data.count).toBe(2);
		expect(data.total).toBeGreaterThanOrEqual(2);
		expect(data.hasMore).toBe(true);
	});

	test('reports auth status without leaking cookie values', async () => {
		setUserInfo({
			loginUin: 'o123456',
			uin: 'o123456',
			cookie: 'uin=o123456; malformed; qqmusic_key=secret-value',
			cookieList: [],
			cookieObject: {},
			refreshData: () => ({}),
		});

		const handlers = createQqMusicMcpHandlers(createServices());
		const result = await handlers.getAuthStatus({ response_format: 'json' });
		const payload = payloadOf(result);
		const text = result.content[0]?.type === 'text' ? result.content[0].text : '';

		expect(payload.ok).toBe(true);
		expect(text).toContain('qqmusic_key');
		expect(text).not.toContain('secret-value');
		expect(payload.metadata).toEqual({ redacted: true });
		expect((payload.data as { cookieKeys: string[] }).cookieKeys).toEqual(['uin', 'qqmusic_key']);
	});

	test('searches songs through the service layer with normalized params', async () => {
		const services = createServices();
		const handlers = createQqMusicMcpHandlers(services);

		const result = await handlers.searchSongs({
			keyword: 'jay',
			page: 2,
			limit: 5,
			remoteplace: 'song',
			response_format: 'json',
		});

		expect(services.getSearchByKey).toHaveBeenCalledWith({
			method: 'get',
			params: {
				w: 'jay',
				n: 5,
				p: 2,
				catZhida: 1,
				remoteplace: 'txt.yqq.song',
			},
			option: {},
		});
		expect(payloadOf(result)).toMatchObject({
			ok: true,
			tool: 'qq_music_search_songs',
			status: 200,
		});
	});

	test('returns MCP tool errors without throwing protocol errors', async () => {
		const services = createServices({
			getTopLists: vi.fn().mockRejectedValue(new Error('network down')),
		});
		const handlers = createQqMusicMcpHandlers(services);

		const result = await handlers.getTopLists({ response_format: 'json' });
		const payload = payloadOf(result);

		expect(result.isError).toBe(true);
		expect(payload).toMatchObject({
			ok: false,
			tool: 'qq_music_get_top_lists',
			error: {
				code: 'MCP_TOOL_FAILED',
				message: 'network down',
			},
		});
	});

	test('bounds upstream error messages in structured content', async () => {
		const longDetail = 'x'.repeat(5_000);
		const services = createServices({
			getTopLists: vi.fn().mockResolvedValue({
				status: 502,
				body: {
					error: {
						detail: longDetail,
					},
				},
			}),
		});
		const handlers = createQqMusicMcpHandlers(services);

		const result = await handlers.getTopLists({ response_format: 'json' });
		const payload = payloadOf(result);

		expect(result.isError).toBe(true);
		expect(payload.error?.code).toBe('UPSTREAM_ERROR');
		expect(payload.error?.message.length).toBeLessThan(2_200);
		expect(payload.error?.message).toContain('Response truncated');
	});
});
