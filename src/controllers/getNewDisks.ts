import { KoaContext } from '../routes/types';
import { getNewDisks } from '../services';
import { setApiResponse, withErrorHandler } from './util';
import { customResponse } from '../util/apiResponse';

const getNewDisksController = withErrorHandler(async (ctx: KoaContext) => {
	const page = Number(ctx.query.page) || 1;
	const num = Number(ctx.query.limit) || 20;

	const res = await getNewDisks({ page, num });
	setApiResponse(ctx, customResponse({ response: res }, 200));
});

export default getNewDisksController;
