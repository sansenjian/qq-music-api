import { KoaContext } from '../routes/types';
import { getRelatedPlaylists } from '../services';
import { setApiResponse, withErrorHandler } from './util';

export default withErrorHandler(async (ctx: KoaContext) => {
	const songid = ctx.query.songid || ctx.query.id;

	if (!songid) {
		setApiResponse(ctx, { status: 400, body: { response: 'no songid' } });
		return;
	}

	const result = await getRelatedPlaylists({
		method: 'post',
		params: {
			songid,
			sin: ctx.query.sin,
			lastId: ctx.query.lastId,
			songType: ctx.query.songType,
		},
		option: {},
	});
	setApiResponse(ctx, result);
}, 'getRelatedPlaylists');
