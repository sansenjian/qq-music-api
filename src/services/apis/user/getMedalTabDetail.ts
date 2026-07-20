import { callUserMusicu } from './userMusicu';

/**
 * 获取指定勋章分类下的勋章列表
 * 模块: music.medalHall.MedalHallHomepageSrv / GetHomepageTabDetail
 *
 * @param tabId 分类 ID（如 2=乐迷）
 * @param euin 加密的 uin，从 cookie 中提取
 */
export const getMedalTabDetail = async ({ tabId, euin, cookie }: { tabId: number; euin?: string; cookie?: string }) => {
	const param: Record<string, unknown> = { tabId };
	if (euin) param.euin = euin;

	return callUserMusicu({
		module: 'music.medalHall.MedalHallHomepageSrv',
		method: 'GetHomepageTabDetail',
		param,
		cookie,
	});
};
