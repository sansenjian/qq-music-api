import { callUserMusicu } from './userMusicu';

/**
 * 获取用户勋章主页（含音响力、勋章总数、分类统计）
 * 模块: music.medalHall.MedalHallHomepageSrv / GetHomepageHeader
 */
export const getUserMedal = async ({ euin, cookie }: { euin?: string; cookie?: string }) =>
	callUserMusicu({
		module: 'music.medalHall.MedalHallHomepageSrv',
		method: 'GetHomepageHeader',
		param: { ...(euin ? { uin: euin } : {}), IsQueryTabDetail: 1 },
		cookie,
	});
