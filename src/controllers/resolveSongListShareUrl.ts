import { KoaContext } from '../routes/types';
import { songListDetail } from '../services';
import { parseShareUrl } from '../util/parseShareUrl';
import { setApiResponse, withErrorHandler } from './util';

/**
 * 自动解析 QQ 音乐分享链接并返回歌单详情。
 *
 * 输入支持:
 *  - i2.y.qq.com/n3/other/pages/details/playlist.html?...&id=2029866739
 *  - y.qq.com/n/ryqq/playlist/2029866739
 *  - 带文字包围的分享消息(自动提取 URL)
 *
 * 不支持的格式(返回 400):
 *  - 字母 MID 形式(如 CBOxxx,本接口暂未对接字母 MID 转换)
 *  - 无法识别为歌单链接的输入
 */
const resolveSongListShareUrlController = withErrorHandler(async (ctx: KoaContext) => {
	const url = (ctx.query.url as string) || (ctx.params.url as string) || '';

	if (!url || !url.trim()) {
		setApiResponse(ctx, { status: 400, body: { response: '缺少参数 url:分享链接' } });
		return;
	}

	const parsed = parseShareUrl(url);

	if (parsed.type !== 'songlist') {
		setApiResponse(ctx, {
			status: 400,
			body: { response: parsed.error || '无法识别的歌单分享链接' },
		});
		return;
	}

	if (!parsed.disstid) {
		// 字母 MID 形式,目前 songListDetail 上游接口只接受数字 disstid
		setApiResponse(ctx, {
			status: 400,
			body: {
				response: `识别到字母 MID(${parsed.mid}),当前接口仅支持数字 disstid,请使用 /getSongListDetail 配合字母 MID 调用,或换一个数字 ID 的链接`,
			},
		});
		return;
	}

	const result = await songListDetail({
		method: 'get',
		params: { disstid: parsed.disstid },
		option: {},
	});
	setApiResponse(ctx, result);
});

export default resolveSongListShareUrlController;
