import { KoaContext, Controller } from '../types';
import { checkQQLoginQr } from '../../module';

const controller: Controller = async (ctx, next) => {
	const { ptqrtoken, qrsig } = ctx.query.ptqrtoken ? ctx.query : ctx.request.body || {};

	const params = { ptqrtoken, qrsig };
	const props = {
		method: 'get',
		option: {},
		params
	};

	const { status, body } = await checkQQLoginQr(props);
	ctx.status = status || 500;
	ctx.body = body;
};

export default controller;
