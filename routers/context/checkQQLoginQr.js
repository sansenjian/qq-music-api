const { checkQQLoginQr } = require('../../module');

module.exports = async (ctx, next) => {
	const { ptqrtoken, qrsig } = ctx.query;

	const params = { ptqrtoken, qrsig };

	const props = {
		method: 'get',
		option: {},
		params,
	};
	const data = await checkQQLoginQr(props);
	Object.assign(ctx, { body: data });
};
