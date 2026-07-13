import request from '../../../util/request';
import { handleApi } from '../../../util/apiResponse';

/**
 * 获取用户勋章主页（含音响力、勋章总数、分类统计）
 * 模块: music.medalHall.MedalHallHomepageSrv / GetHomepageHeader
 */
export const getUserMedal = async ({ cookie }: { uin?: string; cookie?: string }) =>
	handleApi(
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
						module: 'music.medalHall.MedalHallHomepageSrv',
						method: 'GetHomepageHeader',
						param: {},
					},
				}),
			},
		}),
	);
