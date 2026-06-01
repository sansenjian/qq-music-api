import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { getConfigDir, resolveConfigPath } from '../config/config-path';
import { getUserInfo } from '../config/user-info-store';
import { apiMetadata } from '../routes/api-metadata';
import {
	getAlbumInfo,
	getHotKey,
	getSearchByKey,
	getTopLists,
	songListDetail,
} from '../services';
import type { ApiResponse } from '../types/api';
import { getCookieKeys } from '../util/cookieResolver';

const CHARACTER_LIMIT = 24_000;
const ERROR_MESSAGE_LIMIT = 2_000;

const responseFormatField = z
	.enum(['markdown', 'json'])
	.default('markdown')
	.describe("Response format. Use 'markdown' for readable summaries or 'json' for structured output.");

// The MCP SDK accepts Zod raw shapes here and serializes them to JSON Schema in listTools.
const mcpOutputShape = {
	ok: z.boolean(),
	tool: z.string(),
	status: z.number().optional(),
	data: z.unknown().optional(),
	error: z
		.object({
			code: z.string(),
			message: z.string(),
		})
		.optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
};

type ResponseFormat = 'markdown' | 'json';

interface CommonInput {
	response_format?: ResponseFormat;
}

interface ApiCatalogInput extends CommonInput {
	category?: string;
	limit?: number;
	offset?: number;
}

interface SearchSongsInput extends CommonInput {
	keyword: string;
	page?: number;
	limit?: number;
	remoteplace?: 'song' | 'album' | 'mv' | 'singer' | 'smartbox';
}

interface PlaylistDetailInput extends CommonInput {
	disstid: string;
}

interface AlbumInfoInput extends CommonInput {
	albummid: string;
}

interface ServiceCallOptions {
	method?: string;
	params?: Record<string, unknown>;
	option?: Record<string, unknown>;
}

type ServiceCall = (options: ServiceCallOptions) => Promise<ApiResponse>;

export interface QqMusicMcpServices {
	getAlbumInfo: ServiceCall;
	getHotKey: ServiceCall;
	getSearchByKey: ServiceCall;
	getTopLists: ServiceCall;
	songListDetail: ServiceCall;
}

export interface QqMusicToolPayload<TData = unknown> {
	ok: boolean;
	tool: string;
	status?: number;
	data?: TData;
	error?: {
		code: string;
		message: string;
	};
	metadata?: Record<string, unknown>;
}

export const defaultMcpServices: QqMusicMcpServices = {
	getAlbumInfo,
	getHotKey,
	getSearchByKey,
	getTopLists,
	songListDetail,
};

const getResponseFormat = (value: CommonInput): ResponseFormat => value.response_format || 'markdown';

const truncate = (text: string, limit = CHARACTER_LIMIT): string => {
	if (text.length <= limit) return text;
	return `${text.slice(0, limit)}\n\n[Response truncated. Use json format or narrower parameters for more detail.]`;
};

const stringify = (value: unknown): string => {
	try {
		return JSON.stringify(value, null, 2);
	} catch (error) {
		return JSON.stringify(
			{
				error: 'SERIALIZE_FAILED',
				message: error instanceof Error ? error.message : 'Unable to serialize response',
			},
			null,
			2,
		);
	}
};

const jsonBlock = (title: string, value: unknown): string =>
	[`# ${title}`, '', '```json', truncate(stringify(value), 12_000), '```'].join('\n');

const errorMessageText = (value: unknown): string => {
	const text = typeof value === 'string' ? value : stringify(value);
	return truncate(text, ERROR_MESSAGE_LIMIT);
};

const createToolResult = <TData>(
	payload: QqMusicToolPayload<TData>,
	responseFormat: ResponseFormat,
	markdown: string,
): CallToolResult => {
	const text = responseFormat === 'json' ? stringify(payload) : markdown;
	return {
		content: [{ type: 'text', text: truncate(text) }],
		structuredContent: payload as unknown as Record<string, unknown>,
		isError: !payload.ok,
	};
};

const errorResult = (tool: string, error: unknown, responseFormat: ResponseFormat): CallToolResult => {
	const message = errorMessageText(error instanceof Error ? error.message : error);
	const payload: QqMusicToolPayload = {
		ok: false,
		tool,
		error: {
			code: 'MCP_TOOL_FAILED',
			message,
		},
	};

	return createToolResult(payload, responseFormat, `Error: ${message}`);
};

const extractResponseData = (response: ApiResponse): unknown => {
	if ('response' in response.body) return response.body.response;
	if ('data' in response.body) return response.body.data;
	return response.body;
};

const extractResponseError = (response: ApiResponse): unknown => {
	if ('error' in response.body) return response.body.error;
	return undefined;
};

const serviceResult = (
	tool: string,
	response: ApiResponse,
	responseFormat: ResponseFormat,
	title: string,
): CallToolResult => {
	const upstreamError = extractResponseError(response);
	const ok = response.status >= 200 && response.status < 400 && upstreamError === undefined;
	const data = extractResponseData(response);
	const payload: QqMusicToolPayload = ok
		? {
				ok,
				tool,
				status: response.status,
				data,
			}
		: {
				ok,
				tool,
				status: response.status,
				error: {
					code: 'UPSTREAM_ERROR',
					message: errorMessageText(upstreamError ?? data),
				},
				data,
			};

	return createToolResult(payload, responseFormat, jsonBlock(title, data));
};

const apiCatalogMarkdown = (payload: QqMusicToolPayload): string => {
	const data = payload.data as {
		total: number;
		count: number;
		offset: number;
		limit: number;
		items: Array<{
			name: string;
			category: string;
			method: string;
			path: string;
			cookieRequired?: boolean;
		}>;
	};

	const lines = [
		'# QQ Music API Catalog',
		'',
		`Showing ${data.count} of ${data.total} APIs from offset ${data.offset}.`,
		'',
		'| Name | Category | Method | Path | Auth |',
		'| --- | --- | --- | --- | --- |',
	];

	data.items.forEach(item => {
		lines.push(
			`| ${item.name} | ${item.category} | ${item.method} | ${item.path} | ${
				item.cookieRequired ? 'cookie' : 'public'
			} |`,
		);
	});

	return lines.join('\n');
};

export const createQqMusicMcpHandlers = (services: QqMusicMcpServices = defaultMcpServices) => ({
	getConfigStatus: async (input: CommonInput): Promise<CallToolResult> => {
		const responseFormat = getResponseFormat(input);
		const data = {
			configDir: getConfigDir(),
			serviceConfigPath: resolveConfigPath('service-config.json'),
			userInfoPath: resolveConfigPath('user-info.json'),
		};
		const payload: QqMusicToolPayload = {
			ok: true,
			tool: 'qq_music_config_status',
			data,
		};

		return createToolResult(
			payload,
			responseFormat,
			[
				'# QQ Music API Config',
				'',
				`- Config directory: ${data.configDir}`,
				`- Service config: ${data.serviceConfigPath}`,
				`- User info: ${data.userInfoPath}`,
			].join('\n'),
		);
	},

	getAuthStatus: async (input: CommonInput): Promise<CallToolResult> => {
		const responseFormat = getResponseFormat(input);
		const userInfo = getUserInfo();
		const keys = getCookieKeys(userInfo.cookie);
		const data = {
			authenticated: Boolean(userInfo.cookie && (userInfo.uin || userInfo.loginUin)),
			uin: userInfo.uin || userInfo.loginUin || '',
			hasCookie: Boolean(userInfo.cookie),
			cookieKeys: keys,
			cookieCount: keys.length,
		};
		const payload: QqMusicToolPayload = {
			ok: true,
			tool: 'qq_music_auth_status',
			data,
			metadata: {
				redacted: true,
			},
		};

		return createToolResult(
			payload,
			responseFormat,
			[
				'# QQ Music Auth Status',
				'',
				`- Authenticated: ${data.authenticated ? 'yes' : 'no'}`,
				`- UIN: ${data.uin || 'missing'}`,
				`- Cookie: ${data.hasCookie ? 'present' : 'missing'}`,
				`- Cookie keys: ${data.cookieKeys.length ? data.cookieKeys.join(', ') : 'none'}`,
				'',
				'Cookie values are never returned by this MCP tool.',
			].join('\n'),
		);
	},

	listApis: async (input: ApiCatalogInput): Promise<CallToolResult> => {
		const responseFormat = getResponseFormat(input);
		const limit = Math.min(Math.max(input.limit || 20, 1), 100);
		const offset = Math.max(input.offset || 0, 0);
		const category = input.category?.trim();
		const filtered = category ? apiMetadata.filter(item => item.category === category) : apiMetadata;
		const items = filtered.slice(offset, offset + limit);
		const data = {
			total: filtered.length,
			count: items.length,
			offset,
			limit,
			hasMore: offset + items.length < filtered.length,
			nextOffset: offset + items.length < filtered.length ? offset + items.length : undefined,
			items,
		};
		const payload: QqMusicToolPayload = {
			ok: true,
			tool: 'qq_music_list_apis',
			data,
		};

		return createToolResult(payload, responseFormat, apiCatalogMarkdown(payload));
	},

	getHotKeys: async (input: CommonInput): Promise<CallToolResult> => {
		const responseFormat = getResponseFormat(input);
		try {
			const response = await services.getHotKey({ method: 'get', params: {}, option: {} });
			return serviceResult('qq_music_get_hot_keys', response, responseFormat, 'QQ Music Hot Keys');
		} catch (error) {
			return errorResult('qq_music_get_hot_keys', error, responseFormat);
		}
	},

	searchSongs: async (input: SearchSongsInput): Promise<CallToolResult> => {
		const responseFormat = getResponseFormat(input);
		try {
			const response = await services.getSearchByKey({
				method: 'get',
				params: {
					w: input.keyword,
					n: Math.min(Math.max(input.limit || 10, 1), 50),
					p: Math.max(input.page || 1, 1),
					catZhida: 1,
					remoteplace: `txt.yqq.${input.remoteplace || 'song'}`,
				},
				option: {},
			});
			return serviceResult('qq_music_search_songs', response, responseFormat, 'QQ Music Search Songs');
		} catch (error) {
			return errorResult('qq_music_search_songs', error, responseFormat);
		}
	},

	getTopLists: async (input: CommonInput): Promise<CallToolResult> => {
		const responseFormat = getResponseFormat(input);
		try {
			const response = await services.getTopLists({ method: 'get', params: {}, option: {} });
			return serviceResult('qq_music_get_top_lists', response, responseFormat, 'QQ Music Top Lists');
		} catch (error) {
			return errorResult('qq_music_get_top_lists', error, responseFormat);
		}
	},

	getPlaylistDetail: async (input: PlaylistDetailInput): Promise<CallToolResult> => {
		const responseFormat = getResponseFormat(input);
		try {
			const response = await services.songListDetail({
				method: 'get',
				params: {
					disstid: input.disstid,
				},
				option: {},
			});
			return serviceResult('qq_music_get_playlist_detail', response, responseFormat, 'QQ Music Playlist Detail');
		} catch (error) {
			return errorResult('qq_music_get_playlist_detail', error, responseFormat);
		}
	},

	getAlbumInfo: async (input: AlbumInfoInput): Promise<CallToolResult> => {
		const responseFormat = getResponseFormat(input);
		try {
			const response = await services.getAlbumInfo({
				method: 'get',
				params: {
					albummid: input.albummid,
				},
				option: {},
			});
			return serviceResult('qq_music_get_album_info', response, responseFormat, 'QQ Music Album Info');
		} catch (error) {
			return errorResult('qq_music_get_album_info', error, responseFormat);
		}
	},
});

export const registerQqMusicMcpTools = (
	server: McpServer,
	services: QqMusicMcpServices = defaultMcpServices,
): void => {
	const handlers = createQqMusicMcpHandlers(services);
	const readOnlyLocal = {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	};
	const readOnlyExternal = {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: true,
	};

	server.registerTool(
		'qq_music_config_status',
		{
			title: 'QQ Music Config Status',
			description: 'Return local QQ Music API config paths. Does not read or expose credential values.',
			inputSchema: { response_format: responseFormatField },
			outputSchema: mcpOutputShape,
			annotations: readOnlyLocal,
		},
		handlers.getConfigStatus,
	);

	server.registerTool(
		'qq_music_auth_status',
		{
			title: 'QQ Music Auth Status',
			description: 'Return redacted login status and cookie key names. Never returns full cookie values.',
			inputSchema: { response_format: responseFormatField },
			outputSchema: mcpOutputShape,
			annotations: readOnlyLocal,
		},
		handlers.getAuthStatus,
	);

	server.registerTool(
		'qq_music_list_apis',
		{
			title: 'List QQ Music APIs',
			description: 'List the HTTP API catalog exposed by this package with optional category filtering and pagination.',
			inputSchema: {
				category: z.string().min(1).max(40).optional().describe("Optional category such as 'search', 'music', or 'playlist'."),
				limit: z.number().int().min(1).max(100).default(20).describe('Maximum APIs to return.'),
				offset: z.number().int().min(0).default(0).describe('Number of APIs to skip.'),
				response_format: responseFormatField,
			},
			outputSchema: mcpOutputShape,
			annotations: readOnlyLocal,
		},
		handlers.listApis,
	);

	server.registerTool(
		'qq_music_get_hot_keys',
		{
			title: 'Get QQ Music Hot Keys',
			description: 'Fetch public QQ Music search hot keys from the upstream service.',
			inputSchema: { response_format: responseFormatField },
			outputSchema: mcpOutputShape,
			annotations: readOnlyExternal,
		},
		handlers.getHotKeys,
	);

	server.registerTool(
		'qq_music_search_songs',
		{
			title: 'Search QQ Music Songs',
			description: 'Search public QQ Music results by keyword. Does not require or expose cookies.',
			inputSchema: {
				keyword: z.string().min(1).max(100).describe('Search keyword, for example a song title or artist name.'),
				page: z.number().int().min(1).default(1).describe('Result page number, starting from 1.'),
				limit: z.number().int().min(1).max(50).default(10).describe('Maximum results per page.'),
				remoteplace: z
					.enum(['song', 'album', 'mv', 'singer', 'smartbox'])
					.default('song')
					.describe('QQ Music search scope.'),
				response_format: responseFormatField,
			},
			outputSchema: mcpOutputShape,
			annotations: readOnlyExternal,
		},
		handlers.searchSongs,
	);

	server.registerTool(
		'qq_music_get_top_lists',
		{
			title: 'Get QQ Music Top Lists',
			description: 'Fetch public QQ Music ranking list metadata.',
			inputSchema: { response_format: responseFormatField },
			outputSchema: mcpOutputShape,
			annotations: readOnlyExternal,
		},
		handlers.getTopLists,
	);

	server.registerTool(
		'qq_music_get_playlist_detail',
		{
			title: 'Get QQ Music Playlist Detail',
			description: 'Fetch public QQ Music playlist details by disstid.',
			inputSchema: {
				disstid: z.string().min(1).max(80).describe('QQ Music playlist disstid.'),
				response_format: responseFormatField,
			},
			outputSchema: mcpOutputShape,
			annotations: readOnlyExternal,
		},
		handlers.getPlaylistDetail,
	);

	server.registerTool(
		'qq_music_get_album_info',
		{
			title: 'Get QQ Music Album Info',
			description: 'Fetch public QQ Music album information by albummid.',
			inputSchema: {
				albummid: z.string().min(1).max(80).describe('QQ Music album MID.'),
				response_format: responseFormatField,
			},
			outputSchema: mcpOutputShape,
			annotations: readOnlyExternal,
		},
		handlers.getAlbumInfo,
	);
};
