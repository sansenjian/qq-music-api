import { Context, Next } from 'koa';
import { songListCategories } from '../../module';

/**
 * @description: 歌单
 * 1 歌单类型
 * 2 所有歌单
 * 3 分类歌单
 * 4 歌单详情
 *
 */
export default async (ctx: Context, next: Next) => {
	const props = {
		method: 'get',
		params: {},
		option: {}
	};
	const { status, body } = await songListCategories(props);
	Object.assign(ctx, {
		status,
		body
	});
};
