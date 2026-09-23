import { KoaContext } from '../routes/types';
import { getMv } from '../services';
import { setApiResponse, withErrorHandler } from './util';
import { customResponse } from '../util/apiResponse';

const getMvController = withErrorHandler(async (ctx: KoaContext) => {
	const rawAreaId = ctx.query.area_id;
	const rawVersionId = ctx.query.version_id;
	const area_id = Array.isArray(rawAreaId) ? rawAreaId[0] : (rawAreaId ?? 15);
	const version_id = Array.isArray(rawVersionId) ? rawVersionId[0] : (rawVersionId ?? 7);
	const limit = +ctx.query.limit || 20;
	const page = +ctx.query.page || 0;

	if (!version_id || !area_id) {
		setApiResponse(ctx, {
			status: 400,
			body: { response: 'version_id or area_id is null' },
		});
		return;
	}

	const response = await getMv({ areaId: area_id, versionId: version_id, limit, page });
	setApiResponse(ctx, customResponse({ response }, 200));
});

export default getMvController;
