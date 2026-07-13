import request from '../../../util/request';
import { handleApi } from '../../../util/apiResponse';

/**
 * 获取用户收藏的 MV 列表
 * 模块: music.musicasset.MVFavRead / getMyFavMV_v2
 *
 * @param page 页码（从 1 开始，内部转为 0 索引）
 * @param limit 每页数量
 * @param euin 加密的 uin，从 cookie 中提取
 */
export const getUserFavMv = async ({
	page = 1,
	limit = 20,
	euin,
	cookie,
}: {
	page?: number;
	limit?: number;
	euin?: string;
	cookie?: string;
}) => {
	const param: Record<string, unknown> = {
		pagesize: limit,
		num: page - 1,
	};
	if (euin) param.encuin = euin;

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
						module: 'music.musicasset.MVFavRead',
						method: 'getMyFavMV_v2',
						param,
					},
				}),
			},
		}),
	);
};
