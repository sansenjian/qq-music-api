import { callUserMusicu } from './userMusicu';

/**
 * 获取用户听歌日历（连续听歌天数、每日听歌记录）
 * 模块: music.medalHall.MedalListeningCalendarSrv / GetListeningCalendar
 *
 * @param euin 加密的 uin，从 cookie 中提取（实际传为 HostUin 参数）
 */
export const getListeningCalendar = async ({
	euin,
	date,
	cookie,
}: {
	euin?: string;
	date?: string;
	cookie?: string;
}) => {
	const param: Record<string, unknown> = {};
	if (euin) param.HostUin = euin;
	if (date) param.Date = date;

	return callUserMusicu({
		module: 'music.medalHall.MedalListeningCalendarSrv',
		method: 'GetListeningCalendar',
		param,
		cookie,
	});
};
