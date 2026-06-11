import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import {
	downloadQQMusic,
	getAlbumInfo,
	getAlbumSongs,
	getComments,
	getDailyRecommend,
	getHotKey,
	getHotComments,
	getLyric,
	getMusicPlay,
	getMvByTag,
	getMvCategory,
	getNewSongs,
	getPersonalRecommend,
	getPlaylistTags,
	getPlaylistsByTag,
	getPrivateFM,
	getRadioLists,
	getRecommendBanner,
	getRelatedMv,
	getRelatedPlaylists,
	getSearchByKey,
	getSimilarSongs,
	getSimilarSinger,
	getSingerListByArea,
	getSingerCategory,
	getSingerDesc,
	getSingerMv,
	getSingerStarNum,
	getSmartbox,
	getSongListCategories,
	getTopLists,
	getConfigDir,
	getCookieKeys,
	getDigitalAlbumLists,
	getUserInfo,
	getUserAvatar,
	getUserCollectedAlbums,
	getUserCollectedSongLists,
	getUserDetail,
	getUserFans,
	getUserFollowSingers,
	getUserFollowUsers,
	getUserLikedSongs,
	getUserPlaylists,
	resolveConfigPath,
	apiMetadata,
	songListDetail,
	songLists,
	type ApiCatalogEntry,
	type DailyRecommendServiceCall,
	type HotCommentsServiceCall,
	type NewSongsServiceCall,
	type PersonalRecommendServiceCall,
	type PlaylistTagsServiceCall,
	type PlaylistsByTagServiceCall,
	type ServiceCall,
	type ServiceResponse,
	type SimilarSongsServiceCall,
	type SingerListByAreaServiceCall,
	type UserOffsetServiceCall,
	type UserAvatarServiceCall,
	type UserInfoSnapshot,
	type UserReadonlyServiceCall,
} from './root-compat';

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
	mcp_callable?: boolean;
	offset?: number;
}

interface CallApiInput extends CommonInput {
	name: string;
	params?: Record<string, unknown>;
}

interface SearchSongsInput extends CommonInput {
	keyword: string;
	page?: number;
	limit?: number;
}

interface PlaylistDetailInput extends CommonInput {
	disstid: string;
}

interface AlbumInfoInput extends CommonInput {
	albummid: string;
}

interface QqMusicMcpServiceDependencies {
	downloadQQMusic: ServiceCall;
	getAlbumInfo: ServiceCall;
	getAlbumSongs: ServiceCall;
	getComments: ServiceCall;
	getDailyRecommend: DailyRecommendServiceCall;
	getDigitalAlbumLists: ServiceCall;
	getHotComments: HotCommentsServiceCall;
	getHotKey: ServiceCall;
	getLyric: ServiceCall;
	getMusicPlay: ServiceCall;
	getMvByTag: ServiceCall;
	getMvCategory: ServiceCall;
	getNewSongs: NewSongsServiceCall;
	getPersonalRecommend: PersonalRecommendServiceCall;
	getPlaylistTags: PlaylistTagsServiceCall;
	getPlaylistsByTag: PlaylistsByTagServiceCall;
	getPrivateFM: DailyRecommendServiceCall;
	getRadioLists: ServiceCall;
	getRecommendBanner: ServiceCall;
	getRelatedMv: ServiceCall;
	getRelatedPlaylists: ServiceCall;
	getSearchByKey: ServiceCall;
	getSimilarSongs: SimilarSongsServiceCall;
	getSimilarSinger: ServiceCall;
	getSingerListByArea: SingerListByAreaServiceCall;
	getSingerCategory: ServiceCall;
	getSingerDesc: ServiceCall;
	getSingerMv: ServiceCall;
	getSingerStarNum: ServiceCall;
	getSmartbox: ServiceCall;
	getSongListCategories: ServiceCall;
	getTopLists: ServiceCall;
	getUserAvatar: UserAvatarServiceCall;
	getUserCollectedAlbums: UserReadonlyServiceCall;
	getUserCollectedSongLists: UserReadonlyServiceCall;
	getUserDetail: UserReadonlyServiceCall;
	getUserFans: UserReadonlyServiceCall;
	getUserFollowSingers: UserReadonlyServiceCall;
	getUserFollowUsers: UserReadonlyServiceCall;
	getUserLikedSongs: UserOffsetServiceCall;
	getUserPlaylists: UserOffsetServiceCall;
	songListDetail: ServiceCall;
	songLists: ServiceCall;
}

export interface QqMusicMcpServices extends Partial<QqMusicMcpServiceDependencies> {
	apiCalls?: QqMusicApiCallMap;
}

type ResolvedQqMusicMcpServices = QqMusicMcpServiceDependencies & Pick<QqMusicMcpServices, 'apiCalls'>;

export type QqMusicApiCall = (params: Record<string, unknown>) => Promise<ServiceResponse>;

export type QqMusicApiCallMap = Record<string, QqMusicApiCall>;

interface McpApiCatalogEntry extends ApiCatalogEntry {
	mcpCallable: boolean;
	mcpUnsupportedReason?: string;
	requiredParams: string[];
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

const statefulOrSensitiveApiNames = new Set(['getCookie', 'setCookie', 'getQQLoginQr', 'checkQQLoginQr']);

const toText = (value: unknown): string | undefined => {
	if (Array.isArray(value)) return toText(value[0]);
	if (value === undefined || value === null) return undefined;
	const text = String(value).trim();
	return text || undefined;
};

const toNumber = (value: unknown, fallback: number): number => {
	const text = toText(value);
	if (!text) return fallback;

	const parsed = Number(text);
	return Number.isFinite(parsed) ? parsed : fallback;
};

const serviceApiCall =
	(service: ServiceCall, method = 'get'): QqMusicApiCall =>
	params =>
		service({ method, params, option: {} });

const musicuPostApiCall =
	(service: ServiceCall): QqMusicApiCall =>
	params =>
		service({ method: 'post', params, option: {} });

const userPageApiCall =
	(
		service: (params: { uin: string; page?: number; limit?: number; cookie?: string }) => Promise<ServiceResponse>,
	): QqMusicApiCall =>
	params =>
		service({
			uin: toText(params.uin) || toText(params.id) || '',
			page: toNumber(params.page ?? params.pageNo, 1),
			limit: toNumber(params.limit ?? params.pageSize, 20),
			cookie: toText(params.cookie),
		});

const userOffsetApiCall =
	(
		service: (params: { uin: string; offset?: number; limit?: number; cookie?: string }) => Promise<ServiceResponse>,
	): QqMusicApiCall =>
	params =>
		service({
			uin: toText(params.uin) || toText(params.id) || '',
			offset: toNumber(params.offset, 0),
			limit: toNumber(params.limit, 30),
			cookie: toText(params.cookie),
		});

const searchByKeyApiCall =
	(service: ServiceCall): QqMusicApiCall =>
	params => {
		const remoteplace = toText(params.remoteplace) || 'song';
		const normalizedRemoteplace = remoteplace.startsWith('txt.yqq.') ? remoteplace : `txt.yqq.${remoteplace}`;

		return service({
			method: 'get',
			params: {
				w: toText(params.key),
				n: toNumber(params.limit, 10),
				p: toNumber(params.page, 1),
				catZhida: toNumber(params.catZhida, 1),
				remoteplace: normalizedRemoteplace,
			},
			option: {},
		});
	};

const songListsApiCall =
	(service: ServiceCall): QqMusicApiCall =>
	params => {
		const limit = toNumber(params.limit, 20);
		const page = toNumber(params.page, 0);

		return service({
			method: 'get',
			params: {
				categoryId: params.categoryId ?? 10000000,
				sortId: params.sortId ?? 5,
				sin: page * limit,
				ein: limit * (page + 1) - 1,
			},
			option: {},
		});
	};

const getCommentsApiCall =
	(service: ServiceCall): QqMusicApiCall =>
	params =>
		service({
			method: 'get',
			params: {
				cid: params.cid ?? 205360772,
				reqtype: params.reqtype ?? 2,
				biztype: params.biztype ?? 1,
				topid: params.id,
				cmd: params.cmd ?? 8,
				pagenum: params.pagenum ?? 0,
				pagesize: params.pagesize ?? 25,
				lasthotcommentid: params.rootcommentid ?? '',
			},
			option: {},
		});

const getLyricApiCall =
	(service: ServiceCall): QqMusicApiCall =>
	params => {
		const cookie = toText(params.cookie);
		const option = cookie ? { headers: { Cookie: cookie } } : {};
		const isFormat =
			typeof params.isFormat === 'boolean'
				? params.isFormat
				: typeof params.isFormat === 'string'
					? toText(params.isFormat)
					: undefined;

		return service({
			method: 'get',
			params: { songmid: toText(params.songmid) },
			option,
			isFormat,
		});
	};

const getMusicPlayApiCall =
	(service: ServiceCall): QqMusicApiCall =>
	params => {
		const cookie = toText(params.cookie);
		const option = cookie ? { headers: { Cookie: cookie } } : {};

		return service({
			method: 'get',
			params: {
				songmid: toText(params.songmid),
				resType: params.resType,
				mediaId: params.mediaId,
				quality: params.quality,
			},
			option,
		});
	};

const getSingerMvApiCall =
	(service: ServiceCall): QqMusicApiCall =>
	params => {
		const order = toText(params.order);
		const serviceParams: Record<string, unknown> = {
			singermid: toText(params.singermid),
			order,
			num: params.num ?? params.limit ?? 5,
		};

		if (order?.toLowerCase() === 'time') {
			serviceParams.cmd = 1;
		}

		return service({ method: 'get', params: serviceParams, option: {} });
	};

const userAvatarApiCall =
	(service: UserAvatarServiceCall): QqMusicApiCall =>
	async params => {
		const data = await service({
			uin: toText(params.uin) || toText(params.id),
			k: toText(params.k),
			size: toNumber(params.size, 140),
		});

		return {
			status: 200,
			body: {
				response: {
					code: 0,
					data,
				},
			},
		};
	};

const cookieOnlyApiCall =
	(service: DailyRecommendServiceCall): QqMusicApiCall =>
	params =>
		service(toText(params.cookie));

const newSongsApiCall =
	(service: NewSongsServiceCall): QqMusicApiCall =>
	params =>
		service(toNumber(params.areaId ?? params.type, 5), toNumber(params.limit ?? params.num, 20));

const personalRecommendApiCall =
	(service: PersonalRecommendServiceCall): QqMusicApiCall =>
	params =>
		service(toNumber(params.type, 1), toText(params.cookie));

const similarSongsApiCall =
	(service: SimilarSongsServiceCall): QqMusicApiCall =>
	params =>
		service(toText(params.songmid) || '', toText(params.cookie));

const playlistTagsApiCall =
	(service: PlaylistTagsServiceCall): QqMusicApiCall =>
	() =>
		service();

const playlistsByTagApiCall =
	(service: PlaylistsByTagServiceCall): QqMusicApiCall =>
	params =>
		service(
			toNumber(params.tagId ?? params.categoryId, 1),
			toNumber(params.page, 0),
			toNumber(params.num ?? params.limit, 20),
		);

const hotCommentsApiCall =
	(service: HotCommentsServiceCall): QqMusicApiCall =>
	params =>
		service(
			toText(params.id) || '',
			toNumber(params.type ?? params.biztype, 1),
			toNumber(params.page ?? params.pagenum, 0),
			toNumber(params.pagesize ?? params.limit, 20),
		);

const singerListByAreaApiCall =
	(service: SingerListByAreaServiceCall): QqMusicApiCall =>
	params =>
		service(
			toNumber(params.area, -1),
			toNumber(params.sex, -1),
			toNumber(params.genre, -1),
			toNumber(params.page, 1),
			toNumber(params.pagesize ?? params.limit, 80),
		);

const defaultMcpServiceDependencies: QqMusicMcpServiceDependencies = {
	downloadQQMusic,
	getAlbumInfo,
	getAlbumSongs,
	getComments,
	getDailyRecommend,
	getDigitalAlbumLists,
	getHotComments,
	getHotKey,
	getLyric,
	getMusicPlay,
	getMvByTag,
	getMvCategory,
	getNewSongs,
	getPersonalRecommend,
	getPlaylistTags,
	getPlaylistsByTag,
	getPrivateFM,
	getRadioLists,
	getRecommendBanner,
	getRelatedMv,
	getRelatedPlaylists,
	getSearchByKey,
	getSimilarSongs,
	getSimilarSinger,
	getSingerListByArea,
	getSingerCategory,
	getSingerDesc,
	getSingerMv,
	getSingerStarNum,
	getSmartbox,
	getSongListCategories,
	getTopLists,
	getUserAvatar,
	getUserCollectedAlbums,
	getUserCollectedSongLists,
	getUserDetail,
	getUserFans,
	getUserFollowSingers,
	getUserFollowUsers,
	getUserLikedSongs,
	getUserPlaylists,
	songListDetail,
	songLists,
};

const createDefaultApiCalls = (services: QqMusicMcpServiceDependencies): QqMusicApiCallMap => ({
	getDownloadQQMusic: serviceApiCall(services.downloadQQMusic),
	getAlbumInfo: serviceApiCall(services.getAlbumInfo),
	getAlbumSongs: musicuPostApiCall(services.getAlbumSongs),
	getComments: getCommentsApiCall(services.getComments),
	getDailyRecommend: cookieOnlyApiCall(services.getDailyRecommend),
	getDigitalAlbumLists: serviceApiCall(services.getDigitalAlbumLists),
	getHotComments: hotCommentsApiCall(services.getHotComments),
	getHotKey: serviceApiCall(services.getHotKey),
	getLyric: getLyricApiCall(services.getLyric),
	getMusicPlay: getMusicPlayApiCall(services.getMusicPlay),
	getMvByTag: serviceApiCall(services.getMvByTag),
	getMvCategory: musicuPostApiCall(services.getMvCategory),
	getNewSongs: newSongsApiCall(services.getNewSongs),
	getPersonalRecommend: personalRecommendApiCall(services.getPersonalRecommend),
	getPlaylistTags: playlistTagsApiCall(services.getPlaylistTags),
	getPlaylistsByTag: playlistsByTagApiCall(services.getPlaylistsByTag),
	getPrivateFM: cookieOnlyApiCall(services.getPrivateFM),
	getRadioLists: serviceApiCall(services.getRadioLists),
	getRecommendBanner: musicuPostApiCall(services.getRecommendBanner),
	getRelatedMv: musicuPostApiCall(services.getRelatedMv),
	getRelatedPlaylists: musicuPostApiCall(services.getRelatedPlaylists),
	getSearchByKey: searchByKeyApiCall(services.getSearchByKey),
	getSimilarSongs: similarSongsApiCall(services.getSimilarSongs),
	getSimilarSinger: serviceApiCall(services.getSimilarSinger),
	getSingerListByArea: singerListByAreaApiCall(services.getSingerListByArea),
	getSingerCategory: musicuPostApiCall(services.getSingerCategory),
	getSingerDesc: serviceApiCall(services.getSingerDesc),
	getSingerMv: getSingerMvApiCall(services.getSingerMv),
	getSingerStarNum: serviceApiCall(services.getSingerStarNum),
	getSmartbox: serviceApiCall(services.getSmartbox),
	getSongListCategories: serviceApiCall(services.getSongListCategories),
	getSongListDetail: serviceApiCall(services.songListDetail),
	getSongLists: songListsApiCall(services.songLists),
	getTopLists: serviceApiCall(services.getTopLists),
	getUserAvatar: userAvatarApiCall(services.getUserAvatar),
	getUserCollectedAlbums: userPageApiCall(services.getUserCollectedAlbums),
	getUserCollectedSongLists: userPageApiCall(services.getUserCollectedSongLists),
	getUserDetail: userPageApiCall(services.getUserDetail),
	getUserFans: userPageApiCall(services.getUserFans),
	getUserFollowSingers: userPageApiCall(services.getUserFollowSingers),
	getUserFollowUsers: userPageApiCall(services.getUserFollowUsers),
	getUserLikedSongs: userOffsetApiCall(services.getUserLikedSongs),
	getUserPlaylists: userOffsetApiCall(services.getUserPlaylists),
});

export const defaultApiCalls: QqMusicApiCallMap = createDefaultApiCalls(defaultMcpServiceDependencies);

export const defaultMcpServices: QqMusicMcpServices = { ...defaultMcpServiceDependencies };

const resolveMcpServices = (services: QqMusicMcpServices = {}): ResolvedQqMusicMcpServices => ({
	...defaultMcpServiceDependencies,
	...services,
});

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

const extractResponseData = (response: ServiceResponse): unknown => {
	if ('response' in response.body) return response.body.response;
	if ('data' in response.body) return response.body.data;
	return response.body;
};

const extractResponseError = (response: ServiceResponse): unknown => {
	if ('error' in response.body) return response.body.error;
	return undefined;
};

const serviceResult = (
	tool: string,
	response: ServiceResponse,
	responseFormat: ResponseFormat,
	title: string,
	metadata?: Record<string, unknown>,
): CallToolResult => {
	const upstreamError = extractResponseError(response);
	const ok = response.status >= 200 && response.status < 400 && upstreamError === undefined;
	const data = extractResponseData(response);
	const payloadMetadata = metadata ? { metadata } : {};
	const payload: QqMusicToolPayload = ok
		? {
				ok,
				tool,
				status: response.status,
				data,
				...payloadMetadata,
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
				...payloadMetadata,
			};

	return createToolResult(payload, responseFormat, jsonBlock(title, data));
};

const createErrorToolResult = (
	tool: string,
	code: string,
	message: string,
	responseFormat: ResponseFormat,
	metadata?: Record<string, unknown>,
): CallToolResult => {
	const payload: QqMusicToolPayload = {
		ok: false,
		tool,
		error: {
			code,
			message,
		},
		...(metadata ? { metadata } : {}),
	};

	return createToolResult(payload, responseFormat, `Error: ${message}`);
};

const getApiCalls = (services: ResolvedQqMusicMcpServices): QqMusicApiCallMap => {
	const defaultApiCallMap = createDefaultApiCalls(services);
	return services.apiCalls ? { ...defaultApiCallMap, ...services.apiCalls } : defaultApiCallMap;
};

const getRequiredParams = (item: ApiCatalogEntry): string[] =>
	[...(item.pathParams || []), ...(item.queryParams || [])].filter(param => param.required).map(param => param.name);

const getUnsupportedReason = (item: ApiCatalogEntry, apiCalls: QqMusicApiCallMap): string | undefined => {
	if (statefulOrSensitiveApiNames.has(item.name)) {
		return 'Stateful, login, or credential-management APIs are not callable through this read-only MCP tool.';
	}

	if (item.method !== 'GET') {
		return 'Only read-only GET HTTP API metadata is callable through this MCP tool.';
	}

	if (!apiCalls[item.name]) {
		return 'No MCP service adapter is available for this API yet.';
	}

	return undefined;
};

const enrichApiCatalogEntry = (item: ApiCatalogEntry, apiCalls: QqMusicApiCallMap): McpApiCatalogEntry => {
	const unsupportedReason = getUnsupportedReason(item, apiCalls);

	return {
		...item,
		mcpCallable: !unsupportedReason,
		...(unsupportedReason ? { mcpUnsupportedReason: unsupportedReason } : {}),
		requiredParams: getRequiredParams(item),
	};
};

const getMissingRequiredParams = (item: McpApiCatalogEntry, params: Record<string, unknown>): string[] =>
	item.requiredParams.filter(paramName => toText(params[paramName]) === undefined);

const getParamDetails = (item: ApiCatalogEntry) => [...(item.pathParams || []), ...(item.queryParams || [])];

const formatParamValue = (value: string | number | boolean): string => String(value);

const summarizeParamHints = (item: ApiCatalogEntry): string => {
	const hints = getParamDetails(item)
		.flatMap(param => {
			const details: string[] = [];
			if (param.defaultValue !== undefined) {
				details.push(`${param.name}=${formatParamValue(param.defaultValue)}`);
			}
			if (param.enumValues?.length) {
				details.push(`${param.name}: ${param.enumValues.map(formatParamValue).join('/')}`);
			}
			return details;
		})
		.slice(0, 4);

	return hints.join('; ') || '-';
};

const describeParams = (item: ApiCatalogEntry, paramNames: string[]) => {
	const detailsByName = new Map(getParamDetails(item).map(param => [param.name, param]));

	return paramNames.map(paramName => {
		const param = detailsByName.get(paramName);
		return {
			name: paramName,
			required: Boolean(param?.required),
			description: param?.description,
			defaultValue: param?.defaultValue,
			example: param?.example,
			enumValues: param?.enumValues,
		};
	});
};

const requiredParamAliasesByApiName: Record<string, Record<string, string[]>> = {
	getUserCollectedAlbums: { uin: ['id'] },
	getUserCollectedSongLists: { uin: ['id'] },
	getUserDetail: { uin: ['id'] },
	getUserFans: { uin: ['id'] },
	getUserFollowSingers: { uin: ['id'] },
	getUserFollowUsers: { uin: ['id'] },
	getUserLikedSongs: { uin: ['id'] },
	getUserPlaylists: { uin: ['id'] },
};

const normalizeRequiredParamAliases = (apiName: string, params: Record<string, unknown>): Record<string, unknown> => {
	const aliases = requiredParamAliasesByApiName[apiName];
	if (!aliases) return params;

	const normalizedParams = { ...params };
	Object.entries(aliases).forEach(([requiredParam, aliasNames]) => {
		if (toText(normalizedParams[requiredParam]) !== undefined) return;

		const matchingAliasName = aliasNames.find(aliasName => toText(normalizedParams[aliasName]) !== undefined);
		if (matchingAliasName) {
			normalizedParams[requiredParam] = normalizedParams[matchingAliasName];
		}
	});

	return normalizedParams;
};

const apiCatalogMarkdown = (payload: QqMusicToolPayload): string => {
	const data = payload.data as {
		total: number;
		count: number;
		offset: number;
		limit: number;
		items: McpApiCatalogEntry[];
	};

	const lines = [
		'# QQ Music API Catalog',
		'',
		`Showing ${data.count} of ${data.total} APIs from offset ${data.offset}.`,
		'',
		'| Name | Category | Method | Path | Auth | MCP | Required Params | Defaults / Enums |',
		'| --- | --- | --- | --- | --- | --- | --- | --- |',
	];

	data.items.forEach(item => {
		lines.push(
			`| ${item.name} | ${item.category} | ${item.method} | ${item.path} | ${
				item.cookieRequired ? 'cookie' : 'public'
			} | ${item.mcpCallable ? 'callable' : 'catalog only'} | ${
				item.requiredParams.join(', ') || '-'
			} | ${summarizeParamHints(item)} |`,
		);
	});

	return lines.join('\n');
};

export const createQqMusicMcpHandlers = (services: QqMusicMcpServices = defaultMcpServices) => {
	const resolvedServices = resolveMcpServices(services);
	const apiCalls = getApiCalls(resolvedServices);
	let enrichedApiCatalogCache: McpApiCatalogEntry[] | undefined;
	const getEnrichedApiCatalog = (): McpApiCatalogEntry[] => {
		enrichedApiCatalogCache ??= apiMetadata.map(item => enrichApiCatalogEntry(item, apiCalls));
		return enrichedApiCatalogCache;
	};

	return {
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
			const userInfo: UserInfoSnapshot = getUserInfo();
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
			const catalog = getEnrichedApiCatalog();
			const categoryFiltered = category ? catalog.filter(item => item.category === category) : catalog;
			const filtered =
				input.mcp_callable === undefined
					? categoryFiltered
					: categoryFiltered.filter(item => item.mcpCallable === input.mcp_callable);
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

		callApi: async (input: CallApiInput): Promise<CallToolResult> => {
			const responseFormat = getResponseFormat(input);
			const name = input.name.trim();
			const params = input.params || {};
			const catalogItem = getEnrichedApiCatalog().find(item => item.name === name);

			if (!catalogItem) {
				return createErrorToolResult(
					'qq_music_call_api',
					'API_NOT_FOUND',
					`Unknown QQ Music API metadata name: ${name}. Use qq_music_list_apis to discover available APIs.`,
					responseFormat,
					{ listTool: 'qq_music_list_apis' },
				);
			}

			if (!catalogItem.mcpCallable) {
				return createErrorToolResult(
					'qq_music_call_api',
					'API_NOT_CALLABLE',
					`${name} is catalog-only for MCP. ${catalogItem.mcpUnsupportedReason}`,
					responseFormat,
					{
						api: name,
						reason: catalogItem.mcpUnsupportedReason,
						listTool: 'qq_music_list_apis',
					},
				);
			}

			const paramsForValidation = normalizeRequiredParamAliases(name, params);
			const missingParams = getMissingRequiredParams(catalogItem, paramsForValidation);
			if (missingParams.length > 0) {
				return createErrorToolResult(
					'qq_music_call_api',
					'MISSING_REQUIRED_PARAMS',
					`${name} requires: ${missingParams.join(', ')}`,
					responseFormat,
					{
						api: name,
						missingParams,
						requiredParams: catalogItem.requiredParams,
						params: describeParams(catalogItem, catalogItem.requiredParams),
					},
				);
			}

			try {
				const response = await apiCalls[name](params);
				return serviceResult('qq_music_call_api', response, responseFormat, `QQ Music API ${name}`, {
					api: name,
					category: catalogItem.category,
					path: catalogItem.path,
					cookieRequired: Boolean(catalogItem.cookieRequired),
					paramsRedacted: true,
				});
			} catch (error) {
				return errorResult('qq_music_call_api', error, responseFormat);
			}
		},

		getHotKeys: async (input: CommonInput): Promise<CallToolResult> => {
			const responseFormat = getResponseFormat(input);
			try {
				const response = await resolvedServices.getHotKey({ method: 'get', params: {}, option: {} });
				return serviceResult('qq_music_get_hot_keys', response, responseFormat, 'QQ Music Hot Keys');
			} catch (error) {
				return errorResult('qq_music_get_hot_keys', error, responseFormat);
			}
		},

		searchSongs: async (input: SearchSongsInput): Promise<CallToolResult> => {
			const responseFormat = getResponseFormat(input);
			try {
				const response = await resolvedServices.getSearchByKey({
					method: 'get',
					params: {
						w: input.keyword,
						n: Math.min(Math.max(input.limit || 10, 1), 50),
						p: Math.max(input.page || 1, 1),
						catZhida: 1,
						remoteplace: 'txt.yqq.song',
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
				const response = await resolvedServices.getTopLists({ method: 'get', params: {}, option: {} });
				return serviceResult('qq_music_get_top_lists', response, responseFormat, 'QQ Music Top Lists');
			} catch (error) {
				return errorResult('qq_music_get_top_lists', error, responseFormat);
			}
		},

		getPlaylistDetail: async (input: PlaylistDetailInput): Promise<CallToolResult> => {
			const responseFormat = getResponseFormat(input);
			try {
				const response = await resolvedServices.songListDetail({
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
				const response = await resolvedServices.getAlbumInfo({
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
	};
};

export const registerQqMusicMcpTools = (server: McpServer, services: QqMusicMcpServices = defaultMcpServices): void => {
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
				category: z
					.string()
					.min(1)
					.max(40)
					.optional()
					.describe("Optional category such as 'search', 'music', or 'playlist'."),
				mcp_callable: z
					.boolean()
					.optional()
					.describe('When set, filter to APIs that are or are not callable through qq_music_call_api.'),
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
		'qq_music_call_api',
		{
			title: 'Call QQ Music API',
			description:
				'Call a metadata-backed, read-only QQ Music API by name. Use qq_music_list_apis with mcp_callable=true to discover supported names and required params.',
			inputSchema: {
				name: z.string().min(1).max(80).describe('API metadata name, for example getAlbumSongs or getRelatedMv.'),
				params: z
					.record(z.string(), z.unknown())
					.default({})
					.describe(
						'HTTP-style parameters for the selected API. Cookie params are accepted only for APIs whose metadata requires them.',
					),
				response_format: responseFormatField,
			},
			outputSchema: mcpOutputShape,
			annotations: readOnlyExternal,
		},
		handlers.callApi,
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
			description: 'Search public QQ Music songs by keyword. Does not require or expose cookies.',
			inputSchema: {
				keyword: z.string().min(1).max(100).describe('Search keyword, for example a song title or artist name.'),
				page: z.number().int().min(1).default(1).describe('Result page number, starting from 1.'),
				limit: z.number().int().min(1).max(50).default(10).describe('Maximum results per page.'),
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
