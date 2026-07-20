import { KoaContext } from '../routes/types';
import {
	getDislikeList,
	getFriendList,
	getHideMedal,
	getListeningCalendar,
	getMedalTabDetail,
	getMusicGene,
	getUserCollectedAlbums,
	getUserCollectedSongLists,
	getUserDetail,
	getUserFans,
	getUserFollowSingers,
	getUserFollowUsers,
	getUserFavMv,
	getUserMedal,
	getVipInfo,
} from '../services';
import { extractEuinFromCookie, resolveRequestCookie } from '../util/cookieResolver';
import { getUserInfo } from '../config/user-info-store';
import type { ApiResponse } from '../types/api';
import { setApiResponse, withErrorHandler } from './util';

type UserReadonlyService = (params: {
	uin: string;
	page?: number;
	limit?: number;
	cookie?: string;
}) => Promise<ApiResponse>;

const MISSING_COOKIE_ERROR = '缺少 cookie 参数';
const MISSING_EUIN_ERROR = '缺少 euin 参数或登录凭证中的 encryptUin';

const getSingleQueryValue = (value: unknown): string | undefined => {
	if (Array.isArray(value)) return getSingleQueryValue(value[0]);
	if (value === undefined || value === null) return undefined;
	const text = String(value).trim();
	return text || undefined;
};

const getPaginationValue = (value: unknown, fallback: number) => {
	const rawValue = getSingleQueryValue(value);
	if (!rawValue) return fallback;

	const parsedValue = Number(rawValue);
	return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

const resolveRequestEuin = (ctx: KoaContext, cookie?: string): string | undefined => {
	const queryEuin = getSingleQueryValue(ctx.query.euin);
	if (queryEuin) return queryEuin;

	const cookieEuin = extractEuinFromCookie(cookie);
	if (cookieEuin) return cookieEuin;

	const stored = getUserInfo();
	return cookie && stored.cookie === cookie && typeof stored.euin === 'string' ? stored.euin : undefined;
};

const createUserReadonlyController = (service: UserReadonlyService, name: string) =>
	withErrorHandler(async (ctx: KoaContext) => {
		const uin = getSingleQueryValue(ctx.query.uin) || getSingleQueryValue(ctx.query.id);

		if (!uin) {
			setApiResponse(ctx, { status: 400, body: { error: '缺少 uin 参数' } });
			return;
		}

		const { cookie } = resolveRequestCookie(ctx);
		const page = getPaginationValue(ctx.query.page || ctx.query.pageNo, 1);
		const limit = getPaginationValue(ctx.query.limit || ctx.query.pageSize, 20);

		const result = await service({
			uin,
			page,
			limit,
			cookie,
		});
		setApiResponse(ctx, result);
	}, name);

type AuthenticatedHandler = (
	ctx: KoaContext,
	auth: { cookie: string; euin?: string },
) => Promise<ApiResponse | undefined>;

const createAuthenticatedController = (handler: AuthenticatedHandler, name: string, requireEuin = false) =>
	withErrorHandler(async (ctx: KoaContext) => {
		const { cookie } = resolveRequestCookie(ctx);
		if (!cookie) {
			setApiResponse(ctx, { status: 400, body: { error: MISSING_COOKIE_ERROR } });
			return;
		}

		const euin = requireEuin ? resolveRequestEuin(ctx, cookie) : undefined;
		if (requireEuin && !euin) {
			setApiResponse(ctx, { status: 400, body: { error: MISSING_EUIN_ERROR } });
			return;
		}

		const result = await handler(ctx, { cookie, euin });
		if (!result) return;
		setApiResponse(ctx, result);
	}, name);

// Cookie-only controllers (no uin required, identity derived from cookie)
const createCookieOnlyController = (service: (params: { cookie?: string }) => Promise<ApiResponse>, name: string) =>
	createAuthenticatedController((_ctx, { cookie }) => service({ cookie }), name);

// Euin-based controllers (extract euin from cookie)
const createEuinController = (
	service: (params: { euin?: string; cookie?: string }) => Promise<ApiResponse>,
	name: string,
) => createAuthenticatedController((_ctx, { cookie, euin }) => service({ euin, cookie }), name, true);

export const getUserDetailController = createUserReadonlyController(getUserDetail, 'getUserDetail');
export const getUserCollectedSongListsController = createUserReadonlyController(
	getUserCollectedSongLists,
	'getUserCollectedSongLists',
);
export const getUserCollectedAlbumsController = createUserReadonlyController(
	getUserCollectedAlbums,
	'getUserCollectedAlbums',
);
export const getUserFollowSingersController = createUserReadonlyController(
	getUserFollowSingers,
	'getUserFollowSingers',
);
export const getUserFollowUsersController = createUserReadonlyController(getUserFollowUsers, 'getUserFollowUsers');
export const getUserFansController = createUserReadonlyController(getUserFans, 'getUserFans');

// Medal & profile extras
export const getUserMedalController = createEuinController(getUserMedal, 'getUserMedal');
export const getVipInfoController = createCookieOnlyController(getVipInfo, 'getVipInfo');
export const getHideMedalController = createEuinController(getHideMedal, 'getHideMedal');
export const getMusicGeneController = createEuinController(getMusicGene, 'getMusicGene');

export const getMedalTabDetailController = createAuthenticatedController(
	async (ctx, { cookie, euin }) => {
		const tabIdRaw = getSingleQueryValue(ctx.query.tabId);
		if (!tabIdRaw) {
			setApiResponse(ctx, { status: 400, body: { error: '缺少 tabId 参数' } });
			return undefined;
		}
		const tabId = Number(tabIdRaw);
		if (!Number.isFinite(tabId)) {
			setApiResponse(ctx, { status: 400, body: { error: 'tabId 必须为数字' } });
			return undefined;
		}
		return getMedalTabDetail({ tabId, euin, cookie });
	},
	'getMedalTabDetail',
	true,
);

export const getListeningCalendarController = createAuthenticatedController(
	async (ctx, { cookie, euin }) => {
		const date = getSingleQueryValue(ctx.query.date);
		return getListeningCalendar({ euin, date, cookie });
	},
	'getListeningCalendar',
	true,
);

export const getFriendListController = createAuthenticatedController(async (ctx, { cookie }) => {
	const page = getPaginationValue(ctx.query.page || ctx.query.pageNo, 1);
	const limit = getPaginationValue(ctx.query.limit || ctx.query.pageSize, 20);
	return getFriendList({ page, limit, cookie });
}, 'getFriendList');

export const getUserFavMvController = createAuthenticatedController(
	async (ctx, { cookie, euin }) => {
		const page = getPaginationValue(ctx.query.page || ctx.query.pageNo, 1);
		const limit = getPaginationValue(ctx.query.limit || ctx.query.pageSize, 20);
		return getUserFavMv({ page, limit, euin, cookie });
	},
	'getUserFavMv',
	true,
);

export const getDislikeListController = createAuthenticatedController(async (ctx, { cookie }) => {
	const cmdRaw = getSingleQueryValue(ctx.query.cmd);
	const cmd = cmdRaw === undefined ? 3 : Number(cmdRaw);
	if (!Number.isInteger(cmd) || ![2, 3, 4].includes(cmd)) {
		setApiResponse(ctx, { status: 400, body: { error: 'cmd 必须为 2、3 或 4' } });
		return undefined;
	}
	const page = getPaginationValue(ctx.query.page || ctx.query.pageNo, 1);
	const lastidRaw = getSingleQueryValue(ctx.query.lastid);
	const parsedLastid = lastidRaw === undefined ? undefined : Number(lastidRaw);
	const lastid = parsedLastid !== undefined && Number.isFinite(parsedLastid) ? parsedLastid : undefined;
	return getDislikeList({ cmd, page, lastid, cookie });
}, 'getDislikeList');
