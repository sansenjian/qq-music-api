import { KoaContext } from '../routes/types';
import { getTicketInfo } from '../services';
import { setApiResponse, withErrorHandler } from './util';
import { customResponse } from '../util/apiResponse';

const getTicketInfoController = withErrorHandler(async (ctx: KoaContext) => {
	const res = await getTicketInfo();
	setApiResponse(ctx, customResponse({ response: res }, 200));
});

export default getTicketInfoController;
