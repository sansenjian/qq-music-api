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
import { extractCookieValue, resolveRequestCookie } from '../util/cookieResolver';
import type { ApiResponse } from '../types/api';
import { setApiResponse, withErrorHandler } from './util';

type UserReadonlyService = (params: {
	uin: string;
	page?: number;
	limit?: number;
	cookie?: string;
}) => Promise<ApiResponse>;

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

// Cookie-only controllers (no uin required, identity derived from cookie)
const createCookieOnlyController = (
	service: (params: { cookie?: string }) => Promise<ApiResponse>,
	name: string,
) =>
	withErrorHandler(async (ctx: KoaContext) => {
		const { cookie } = resolveRequestCookie(ctx);
		if (!cookie) {
			setApiResponse(ctx, { status: 400, body: { error: '缺少 cookie 参数' } });
			return;
		}
		const result = await service({ cookie });
		setApiResponse(ctx, result);
	}, name);

// Euin-based controllers (extract euin from cookie)
const createEuinController = (
	service: (params: { euin?: string; cookie?: string }) => Promise<ApiResponse>,
	name: string,
) =>
	withErrorHandler(async (ctx: KoaContext) => {
		const { cookie } = resolveRequestCookie(ctx);
		if (!cookie) {
			setApiResponse(ctx, { status: 400, body: { error: '缺少 cookie 参数' } });
			return;
		}
		const euin = extractCookieValue(cookie, 'euin');
		if (!euin) {
			setApiResponse(ctx, { status: 400, body: { error: 'cookie 中缺少 euin 字段' } });
			return;
		}
		const result = await service({ euin, cookie });
		setApiResponse(ctx, result);
	}, name);

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
export const getUserMedalController = createCookieOnlyController(getUserMedal, 'getUserMedal');
export const getVipInfoController = createCookieOnlyController(getVipInfo, 'getVipInfo');
export const getHideMedalController = createEuinController(getHideMedal, 'getHideMedal');
export const getMusicGeneController = createEuinController(getMusicGene, 'getMusicGene');

export const getMedalTabDetailController = withErrorHandler(async (ctx: KoaContext) => {
	const { cookie } = resolveRequestCookie(ctx);
	if (!cookie) {
		setApiResponse(ctx, { status: 400, body: { error: '缺少 cookie 参数' } });
		return;
	}
	const euin = extractCookieValue(cookie, 'euin');
	const tabIdRaw = getSingleQueryValue(ctx.query.tabId);
	if (!tabIdRaw) {
		setApiResponse(ctx, { status: 400, body: { error: '缺少 tabId 参数' } });
		return;
	}
	const tabId = Number(tabIdRaw);
	if (!Number.isFinite(tabId)) {
		setApiResponse(ctx, { status: 400, body: { error: 'tabId 必须为数字' } });
		return;
	}
	const result = await getMedalTabDetail({ tabId, euin, cookie });
	setApiResponse(ctx, result);
}, 'getMedalTabDetail');

export const getListeningCalendarController = withErrorHandler(async (ctx: KoaContext) => {
	const { cookie } = resolveRequestCookie(ctx);
	if (!cookie) {
		setApiResponse(ctx, { status: 400, body: { error: '缺少 cookie 参数' } });
		return;
	}
	const euin = extractCookieValue(cookie, 'euin');
	const date = getSingleQueryValue(ctx.query.date);
	const result = await getListeningCalendar({ euin, date, cookie });
	setApiResponse(ctx, result);
}, 'getListeningCalendar');

export const getFriendListController = withErrorHandler(async (ctx: KoaContext) => {
	const { cookie } = resolveRequestCookie(ctx);
	if (!cookie) {
		setApiResponse(ctx, { status: 400, body: { error: '缺少 cookie 参数' } });
		return;
	}
	const page = getPaginationValue(ctx.query.page || ctx.query.pageNo, 1);
	const limit = getPaginationValue(ctx.query.limit || ctx.query.pageSize, 20);
	const result = await getFriendList({ page, limit, cookie });
	setApiResponse(ctx, result);
}, 'getFriendList');

export const getUserFavMvController = withErrorHandler(async (ctx: KoaContext) => {
	const { cookie } = resolveRequestCookie(ctx);
	if (!cookie) {
		setApiResponse(ctx, { status: 400, body: { error: '缺少 cookie 参数' } });
		return;
	}
	const euin = extractCookieValue(cookie, 'euin');
	const page = getPaginationValue(ctx.query.page || ctx.query.pageNo, 1);
	const limit = getPaginationValue(ctx.query.limit || ctx.query.pageSize, 20);
	const result = await getUserFavMv({ page, limit, euin, cookie });
	setApiResponse(ctx, result);
}, 'getUserFavMv');

export const getDislikeListController = withErrorHandler(async (ctx: KoaContext) => {
	const { cookie } = resolveRequestCookie(ctx);
	if (!cookie) {
		setApiResponse(ctx, { status: 400, body: { error: '缺少 cookie 参数' } });
		return;
	}
	const cmd = getPaginationValue(ctx.query.cmd, 3);
	const page = getPaginationValue(ctx.query.page || ctx.query.pageNo, 1);
	const lastidRaw = getSingleQueryValue(ctx.query.lastid);
	const lastid = lastidRaw ? Number(lastidRaw) : undefined;
	const result = await getDislikeList({ cmd, page, lastid, cookie });
	setApiResponse(ctx, result);
}, 'getDislikeList');
