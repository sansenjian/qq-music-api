import { Context, Next } from 'koa';
import { getHotKey } from '../../module';

export default async (ctx: Context, next: Next) => {
	const props = {
		method: 'get',
		params: {},
		option: {}
	};
	const { status, body } = await getHotKey(props);
	Object.assign(ctx, {
		status,
		body
	});
};
