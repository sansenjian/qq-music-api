import { KoaContext } from '../routes/types';
import {
	getUserCollectedAlbums,
	getUserCollectedSongLists,
	getUserDetail,
	getUserFans,
	getUserFollowSingers,
	getUserFollowUsers,
} from '../services';
import { resolveRequestCookie } from '../util/cookieResolver';
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

const createUserReadonlyController = (service: UserReadonlyService, name: string) =>
	withErrorHandler(async (ctx: KoaContext) => {
		const uin = getSingleQueryValue(ctx.query.uin) || getSingleQueryValue(ctx.query.id);

		if (!uin) {
			setApiResponse(ctx, { status: 400, body: { error: '缺少 uin 参数' } });
			return;
		}

		const { cookie } = resolveRequestCookie(ctx);
		const result = await service({
			uin,
			page: Number(ctx.query.page || ctx.query.pageNo || 1),
			limit: Number(ctx.query.limit || ctx.query.pageSize || 20),
			cookie,
		});
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
