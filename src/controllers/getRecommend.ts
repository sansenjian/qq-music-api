import { KoaContext } from '../routes/types';
import { getRecommend } from '../services';
import { setApiResponse, withErrorHandler } from './util';
import { customResponse } from '../util/apiResponse';

const getRecommendController = withErrorHandler(async (ctx: KoaContext) => {
	const res = await getRecommend();
	setApiResponse(ctx, customResponse({ response: res }, 200));
});

export default getRecommendController;
