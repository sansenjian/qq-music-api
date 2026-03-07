import { Context, Next } from 'koa';
import { downloadQQMusic } from '../../module';
import type { ApiResponse } from '../../types/api';

export default async (ctx: Context, next: Next) => {
	const props = {
		method: 'get',
		params: {},
		option: {}
	};
	const result = await downloadQQMusic(props) as ApiResponse;
	const { status, body } = result;
	Object.assign(ctx, {
		status,
		body
	});
};
