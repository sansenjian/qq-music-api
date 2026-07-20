import { callUserMusicu } from './userMusicu';

/**
 * 获取 VIP 会员详细信息（到期时间、豪华VIP、音效权限等）
 * 模块: VipLogin.VipLoginInter / vip_login_base
 */
export const getVipInfo = async ({ cookie }: { cookie?: string }) =>
	callUserMusicu({
		module: 'VipLogin.VipLoginInter',
		method: 'vip_login_base',
		param: {},
		cookie,
	});
