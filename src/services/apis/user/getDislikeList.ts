import { callUserMusicu } from './userMusicu';

/**
 * 获取用户不喜欢列表（歌曲 / 歌手 / 风格）
 * 模块: music.feedback.FeedbackBlack / GetDislikeList
 *
 * @param cmd 类型: 2=歌手 / 3=歌曲 / 4=风格
 * @param page 页码
 * @param lastid 分页游标（对应 SongsLastid / SingersLastid / StyleLastid）
 */
export const getDislikeList = async ({
	cmd = 3,
	page = 1,
	lastid,
	cookie,
}: {
	cmd?: number;
	page?: number;
	lastid?: number;
	cookie?: string;
}) => {
	const lastidFields: Record<number, string> = {
		2: 'SingersLastid',
		3: 'SongLastid',
		4: 'StyleLastid',
	};
	const param: Record<string, unknown> = { Cmd: cmd, Page: page };
	if (lastid !== undefined && lastidFields[cmd]) {
		param[lastidFields[cmd]] = lastid;
	}

	return callUserMusicu({
		module: 'music.feedback.FeedbackBlack',
		method: 'GetDislikeList',
		param,
		cookie,
		signed: true,
	});
};
