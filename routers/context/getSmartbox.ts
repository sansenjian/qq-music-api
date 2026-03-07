import { Context, Next } from 'koa';
import { getSmartbox } from '../../module';
import type { ApiResponse } from '../../types/api';

export default async (ctx: Context, next: Next) => {
	const { key } = ctx.query;
	const props = {
		method: 'get',
		params: {
			key
		},
		option: {}
	};
	if (key) {
		const result = await getSmartbox(props) as ApiResponse;
		const { status, body } = result;
		Object.assign(ctx, {
			status,
			body
		});
	} else {
		ctx.status = 200;
		ctx.body = {
			response: null
		};
	}
};
