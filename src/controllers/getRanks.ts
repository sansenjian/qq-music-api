import { KoaContext } from '../routes/types';
import { getRanks } from '../services';
import { setApiResponse, withErrorHandler } from './util';
import { customResponse } from '../util/apiResponse';

const getRanksController = withErrorHandler(async (ctx: KoaContext) => {
	const topId = +ctx.query.topId || 4;
	const num = +ctx.query.limit || 20;
	const offset = +ctx.query.page || 0;
	const resolveMidRaw = Array.isArray(ctx.query.resolveMid) ? ctx.query.resolveMid[0] : ctx.query.resolveMid;
	const resolveMid = resolveMidRaw === 'true';

	const response = await getRanks({ topId, num, offset, resolveMid });
	setApiResponse(ctx, customResponse({ response }, 200));
});

export default getRanksController;
