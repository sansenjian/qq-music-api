import { KoaContext } from '../routes/types';
import { batchGetSongInfo } from '../services';
import { setApiResponse, withErrorHandler } from './util';
import { customResponse } from '../util/apiResponse';

const batchGetSongInfoController = withErrorHandler(async (ctx: KoaContext) => {
	const { songs } = ctx.request.body || {};
	const data = await batchGetSongInfo((songs || []) as Array<[string, string?]>);
	setApiResponse(ctx, customResponse({ response: data }, 200));
});

export default batchGetSongInfoController;
