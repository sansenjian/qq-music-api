import request from '../../../util/request';
import { handleApi } from '../../../util/apiResponse';

export const getUserDetail = async ({
	uin,
	cookie,
}: {
	uin: string;
	cookie?: string;
}) =>
	handleApi(
		request({
			url: '/rsc/fcgi-bin/fcg_get_profile_homepage.fcg',
			method: 'GET',
			cookie,
			options: {
				params: {
					_: Date.now(),
					cv: 4747474,
					ct: 24,
					format: 'json',
					inCharset: 'utf-8',
					outCharset: 'utf-8',
					notice: 0,
					platform: 'yqq.json',
					needNewCode: 0,
					uin: Number.parseInt(uin, 10),
					g_tk_new_20200303: 0,
					g_tk: 0,
					cid: 205360838,
					userid: Number.parseInt(uin, 10),
					reqfrom: 1,
				},
				headers: {
					Referer: `https://y.qq.com/portal/profile.html?uin=${uin}`,
				},
			},
		}),
	);
