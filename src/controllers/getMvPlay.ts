import { KoaContext } from '../routes/types';
import { getMvPlay } from '../services';
import { setApiResponse, withErrorHandler } from './util';
import { customResponse } from '../util/apiResponse';

const getMvPlayController = withErrorHandler(async (ctx: KoaContext) => {
	const vid = Array.isArray(ctx.query.vid) ? ctx.query.vid[0] : ctx.query.vid;

	if (!vid) {
		setApiResponse(ctx, {
			status: 400,
			body: { response: 'vid is null' },
		});
		return;
	}

	const data = await getMvPlay(String(vid));
	const mvurls = data?.getMVUrl?.data;

	if (!mvurls || typeof mvurls !== 'object' || Object.keys(mvurls).length === 0) {
		setApiResponse(ctx, {
			status: 502,
			body: {
				response: {
					data: null,
					error: 'Failed to get MV URL data',
				},
			},
		});
		return;
	}

	const mvurlskey = Object.keys(mvurls)[0];
	const mp4_urls = mvurls[mvurlskey]?.mp4?.map((item: any) => item.freeflow_url) || [];
	const hls_urls = mvurls[mvurlskey]?.hls?.map((item: any) => item.freeflow_url) || [];
	const urls = [...mp4_urls, ...hls_urls];

	let play_urls: string[] = [];
	const playLists: Record<string, string[]> = {
		f10: [],
		f20: [],
		f30: [],
		f40: [],
	};

	if (urls.length) {
		urls.forEach((url: string[]) => {
			play_urls = [...play_urls, ...url];
		});
		playLists.f10 = play_urls.filter((item: string) => /\.f10\.mp4/.test(item));
		playLists.f20 = play_urls.filter((item: string) => /\.f20\.mp4/.test(item));
		playLists.f30 = play_urls.filter((item: string) => /\.f30\.mp4/.test(item));
		playLists.f40 = play_urls.filter((item: string) => /\.f40\.mp4/.test(item));
	}

	data.playLists = playLists;
	setApiResponse(ctx, customResponse({ response: data }, 200));
});

export default getMvPlayController;
