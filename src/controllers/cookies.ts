import { Context, Next } from 'koa';
import { getUserInfo } from '../config/user-info-store';

/*
 * @Author: Rainy [https://github.com/rain120]
 * @Date: 2021-01-23 15:41:41
 * @LastEditors: Rainy
 * @LastEditTime: 2021-06-19 22:22:31
 */
export default {
	get: async (ctx: Context, next: Next) => {
		const userInfo = getUserInfo();
		ctx.status = 200;
		ctx.body = {
			data: {
				code: 200,
				cookie: userInfo.cookie,
				cookieList: userInfo.cookieList,
				cookieObject: userInfo.cookieObject
			}
		};

		await next();
	},
	set: async (ctx: Context, next: Next) => {
		(ctx.request as any).cookies = getUserInfo().cookie;
		ctx.request.header['Access-Control-Allow-Origin'] = 'https://y.qq.com';
		ctx.request.header['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE';
		ctx.request.header['Access-Control-Allow-Headers'] = 'Content-Type';
		(ctx.request.header as any)['Access-Control-Allow-Credentials'] = true;
		ctx.body = {
			data: {
				code: 200,
				message: '操作成功'
			}
		};

		await next();
	}
};
