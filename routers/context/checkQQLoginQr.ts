import { KoaContext, Controller } from '../types';

const controller: Controller = async (ctx, next) => {
	const { ptqrtoken, qrsig } = ctx.query.ptqrtoken
		? ctx.query
		: ctx.body || {};

  const params = { ptqrtoken, qrsig };

  const props = {
    method: 'get',
    option: {},
    params
  };
  
  const data = await (require('../../module').checkQQLoginQr)(props);
  ctx.status = data?.status || 500;
  ctx.body = data;
};

export default controller;
