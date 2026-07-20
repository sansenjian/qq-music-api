import { callUserMusicu } from './userMusicu';

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
	callUserMusicu({
		module: 'music.homepage.Friendship',
		method: 'GetFriendList',
		param: { PageSize: limit, Page: page - 1 },
		cookie,
	});
