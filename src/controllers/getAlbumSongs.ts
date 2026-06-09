import { KoaContext } from '../routes/types';
import { getAlbumSongs } from '../services';
import { setApiResponse, withErrorHandler } from './util';

export default withErrorHandler(async (ctx: KoaContext) => {
	const albummid = ctx.query.albummid || ctx.params.albummid;

	if (!albummid) {
		setApiResponse(ctx, { status: 400, body: { response: 'no albummid' } });
		return;
	}

	const result = await getAlbumSongs({
		method: 'post',
		params: {
			albummid,
			albumid: ctx.query.albumid,
			begin: ctx.query.begin,
			limit: ctx.query.limit,
			order: ctx.query.order,
		},
		option: {},
	});
	setApiResponse(ctx, result);
}, 'getAlbumSongs');
