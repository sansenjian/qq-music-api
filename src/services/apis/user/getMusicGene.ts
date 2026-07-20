import { callUserMusicu } from './userMusicu';

/**
 * 获取音乐基因报告（歌手榜、音乐年龄、流派偏好等）
 * 模块: music.recommend.UserProfileSettingSvr / GetProfileReport
 *
 * @param euin 加密的 uin，从 cookie 中提取
 */
export const getMusicGene = async ({ euin, cookie }: { euin?: string; cookie?: string }) => {
	const param: Record<string, unknown> = {};
	if (euin) param.VisitAccount = euin;

	return callUserMusicu({
		module: 'music.recommend.UserProfileSettingSvr',
		method: 'GetProfileReport',
		param,
		cookie,
	});
};
