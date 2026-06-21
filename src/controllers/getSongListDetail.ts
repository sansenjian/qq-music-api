import { KoaContext } from '../routes/types';
import { songListDetail, songListDetailNew } from '../services';
import { setApiResponse, withErrorHandler } from './util';

const getSongListDetailController = withErrorHandler(async (ctx: KoaContext) => {
	const disstid = ctx.query.disstid || ctx.params.disstid;

	if (!disstid) {
		setApiResponse(ctx, { status: 400, body: { response: 'no disstid' } });
		return;
	}

	const props = {
		method: 'get',
		params: {
			disstid
		},
		option: {}
	};

	const result = await songListDetail(props);
	const response = result?.body?.response as Record<string, any> | undefined;
	const subcode = response?.subcode;

	// 旧接口返回隐私校验错误时，尝试新版接口兜底
	if (subcode === 4000) {
		const newResult = await songListDetailNew(props);
		setApiResponse(ctx, newResult);
		return;
	}

	setApiResponse(ctx, result);
});

export default getSongListDetailController;
