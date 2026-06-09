import request from '../../../util/request';
import { handleApi } from '../../../util/apiResponse';

interface UserSocialParams {
	uin: string;
	page?: number;
	limit?: number;
	cookie?: string;
}

export const getUserFollowSingers = async ({
	uin,
	page = 1,
	limit = 20,
	cookie,
}: UserSocialParams) =>
	handleApi(
		request({
			url: '/rsc/fcgi-bin/fcg_order_singer_getlist.fcg',
			method: 'GET',
			cookie,
			options: {
				params: {
					utf8: 1,
					page,
					perpage: limit,
					uin,
					g_tk: 5381,
					format: 'json',
				},
			},
		}),
	);

const getUserFollowOrFans = async ({
	uin,
	page = 1,
	limit = 20,
	cookie,
	isListen,
}: UserSocialParams & { isListen?: boolean }) =>
	handleApi(
		request({
			url: '/rsc/fcgi-bin/friend_follow_or_listen_list.fcg',
			method: 'GET',
			cookie,
			options: {
				params: {
					utf8: 1,
					start: (page - 1) * limit,
					num: limit,
					uin,
					format: 'json',
					g_tk: 5381,
					...(isListen ? { is_listen: 1 } : {}),
				},
			},
		}),
	);

export const getUserFollowUsers = (params: UserSocialParams) => getUserFollowOrFans(params);

export const getUserFans = (params: UserSocialParams) => getUserFollowOrFans({ ...params, isListen: true });
