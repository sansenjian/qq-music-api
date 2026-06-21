import { Controller } from '../routes/types';
import { checkQQLoginQr } from '../services';
import { setApiResponse } from './util';

const controller: Controller = async (ctx, _next) => {
	const { ptqrtoken, qrsig, setCookie } = ctx.query.ptqrtoken ? ctx.query : ctx.request.body || {};

	const params = { ptqrtoken, qrsig, setCookie };
	const props = {
		method: 'get',
		option: {},
		params,
	};

	const { status, body } = await checkQQLoginQr(props);
	setApiResponse(ctx, { status: status || 500, body });
};

export default controller;
