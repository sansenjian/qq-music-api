import request from '../../../util/request';
import { handleApi } from '../../../util/apiResponse';

/**
 * 获取好友列表
 * 模块: music.homepage.Friendship / GetFriendList
 *
 * @param page 页码（从 1 开始，内部转为 0 索引）
 * @param limit 每页数量
 */
export const getFriendList = async ({
	page = 1,
	limit = 20,
	cookie,
}: {
	page?: number;
	limit?: number;
	cookie?: string;
}) =>
	handleApi(
		request({
			url: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
			method: 'POST',
			isUUrl: 'u',
			cookie,
			options: {
				headers: { 'Content-Type': 'application/json', Referer: 'https://y.qq.com/' },
				data: JSON.stringify({
					comm: { uin: '', format: 'json', ct: 24, cv: 4747474, platform: 'yqq.json' },
					req_1: {
						module: 'music.homepage.Friendship',
						method: 'GetFriendList',
						param: { PageSize: limit, Page: page - 1 },
					},
				}),
			},
		}),
	);
