import { KoaContext } from '../routes/types';
import { getSingerList } from '../services';
import { setApiResponse, withErrorHandler } from './util';
import { customResponse } from '../util/apiResponse';

const getSingerListController = withErrorHandler(async (ctx: KoaContext) => {
	const area = ctx.query.area ?? -100;
	const sex = ctx.query.sex ?? -100;
	const genre = ctx.query.genre ?? -100;
	const index = ctx.query.index ?? -100;
	const page = ctx.query.page ?? 1;

	const response = await getSingerList({
		area: Number(area),
		sex: Number(sex),
		genre: Number(genre),
		index: Number(index),
		page: Number(page),
	});
	setApiResponse(ctx, customResponse({ response }, 200));
});

export default getSingerListController;
