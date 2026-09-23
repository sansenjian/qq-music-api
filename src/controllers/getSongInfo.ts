import { KoaContext } from '../routes/types';
import { getSongInfo } from '../services';
import { setApiResponse, withErrorHandler } from './util';
import { customResponse } from '../util/apiResponse';

const getSongInfoController = withErrorHandler(async (ctx: KoaContext) => {
	const songmid = Array.isArray(ctx.query.songmid) ? ctx.query.songmid[0] : ctx.query.songmid;
	const songid = Array.isArray(ctx.query.songid) ? ctx.query.songid[0] : ctx.query.songid;

	const data = await getSongInfo({
		songmid: songmid !== undefined ? String(songmid) : undefined,
		songid: songid !== undefined ? String(songid) : undefined,
	});
	setApiResponse(ctx, customResponse({ response: data }, 200));
});

export default getSongInfoController;
