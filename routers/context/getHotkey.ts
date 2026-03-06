import { Context, Next } from 'koa';
import { getHotKey } from '../../module';

export default async (ctx: Context, next: Next) => {
	const props = {
		method: 'get',
		params: {},
		option: {}
	};

	if (process.env.DEBUG === 'true') {
		console.log('[getHotkey] controller props:', props);
	}

	const { status, body } = await getHotKey(props);

	if (process.env.DEBUG === 'true') {
		console.log('[getHotkey] controller response status:', status);
	}

	Object.assign(ctx, {
		status,
		body
	});
};
