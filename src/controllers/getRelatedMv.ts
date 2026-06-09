import { KoaContext } from '../routes/types';
import { getRelatedMv } from '../services';
import { setApiResponse, withErrorHandler } from './util';

export default withErrorHandler(async (ctx: KoaContext) => {
	const songid = ctx.query.songid || ctx.query.id;

	if (!songid) {
		setApiResponse(ctx, { status: 400, body: { response: 'no songid' } });
		return;
	}

	const result = await getRelatedMv({
		method: 'post',
		params: {
			songid,
			songtype: ctx.query.songtype,
			lastmvid: ctx.query.lastmvid,
			limit: ctx.query.limit,
		},
		option: {},
	});
	setApiResponse(ctx, result);
}, 'getRelatedMv');
