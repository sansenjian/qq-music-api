import request from '../../../util/request';
import { handleApi } from '../../../util/apiResponse';

const getUserCollection = async ({
	uin,
	type,
	page = 1,
	limit = 20,
	cookie,
}: {
	uin: string;
	type: 'songlist' | 'album';
	page?: number;
	limit?: number;
	cookie?: string;
}) => {
	const reqtype = type === 'songlist' ? 3 : 2;
	const sin = (page - 1) * limit;
	const ein = type === 'songlist' ? page * limit : page * limit - 1;

	return handleApi(
		request({
			url: '/fav/fcgi-bin/fcg_get_profile_order_asset.fcg',
			method: 'GET',
			cookie,
			options: {
				params: {
					ct: 20,
					cid: 205360956,
					userid: uin,
					reqtype,
					sin,
					ein,
					format: 'json',
					g_tk: 5381,
				},
				headers: {
					Referer: `https://y.qq.com/portal/profile.html?uin=${uin}`,
				},
			},
		}),
	);
};

export const getUserCollectedSongLists = (params: Omit<Parameters<typeof getUserCollection>[0], 'type'>) =>
	getUserCollection({ ...params, type: 'songlist' });

export const getUserCollectedAlbums = (params: Omit<Parameters<typeof getUserCollection>[0], 'type'>) =>
	getUserCollection({ ...params, type: 'album' });
