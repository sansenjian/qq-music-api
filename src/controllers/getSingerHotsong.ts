import { KoaContext } from '../routes/types';
import { getSingerHotsong } from '../services';
import { setApiResponse, withErrorHandler } from './util';
import { customResponse } from '../util/apiResponse';

const getSingerHotsongController = withErrorHandler(async (ctx: KoaContext) => {
	const singermid = Array.isArray(ctx.query.singermid) ? ctx.query.singermid[0] : ctx.query.singermid;
	const num = Number(ctx.query.limit) || 5;
	const page = Number(ctx.query.page) || 0;

	if (!singermid) {
		setApiResponse(ctx, {
			status: 400,
			body: { response: 'no singermid' },
		});
		return;
	}

	const data = await getSingerHotsong({ singermid: String(singermid), num, page });
	setApiResponse(ctx, customResponse({ response: data }, 200));
});

export default getSingerHotsongController;
