import request from '../../../util/request';
import { handleApi } from '../../../util/apiResponse';

/**
 * 获取 VIP 会员详细信息（到期时间、豪华VIP、音效权限等）
 * 模块: VipLogin.VipLoginInter / vip_login_base
 */
export const getVipInfo = async ({ cookie }: { cookie?: string }) =>
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
						module: 'VipLogin.VipLoginInter',
						method: 'vip_login_base',
						param: {},
					},
				}),
			},
		}),
	);
