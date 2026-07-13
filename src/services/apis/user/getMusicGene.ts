import request from '../../../util/request';
import { handleApi } from '../../../util/apiResponse';

/**
 * 获取音乐基因报告（歌手榜、音乐年龄、流派偏好等）
 * 模块: music.recommend.UserProfileSettingSvr / GetProfileReport
 *
 * @param euin 加密的 uin，从 cookie 中提取
 */
export const getMusicGene = async ({ euin, cookie }: { euin?: string; cookie?: string }) => {
	const param: Record<string, unknown> = {};
	if (euin) param.VisitAccount = euin;

	return handleApi(
		request({
			url: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
			method: 'POST',
			isUUrl: 'u',
			cookie,
			options: {
				headers: { 'Content-Type': 'application/json', Referer: 'https://y.qq.com/' },
				data: JSON.stringify({
					comm: { uin: '', format: 'json', ct: 24, cv: 4747474, platform: 'yqq.json' },
					req_1: {
						module: 'music.recommend.UserProfileSettingSvr',
						method: 'GetProfileReport',
						param,
					},
				}),
			},
		}),
	);
};
