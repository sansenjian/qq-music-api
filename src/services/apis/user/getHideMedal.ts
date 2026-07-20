import { callUserMusicu } from './userMusicu';

/**
 * 获取用户隐藏/神秘勋章列表
 * 模块: music.medalHall.MedalHallHomepageSecondarySrv / GetHideMedal
 *
 * @param euin 加密的 uin，从 cookie 中提取
 */
export const getHideMedal = async ({ euin, cookie }: { euin?: string; cookie?: string }) => {
	const param: Record<string, unknown> = {};
	if (euin) param.euin = euin;

	return callUserMusicu({
		module: 'music.medalHall.MedalHallHomepageSecondarySrv',
		method: 'GetHideMedal',
		param,
		cookie,
	});
};
