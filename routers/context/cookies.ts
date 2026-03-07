import { Context, Next } from 'koa';

/*
 * @Author: Rainy [https://github.com/rain120]
 * @Date: 2021-01-23 15:41:41
 * @LastEditors: Rainy
 * @LastEditTime: 2021-06-19 22:22:31
 */
export default {
	get: async (ctx: Context, next: Next) => {
		ctx.status = 200;
		ctx.body = {
			data: {
				code: 200,
				cookie: (global.userInfo as any).cookie,
				cookieList: (global.userInfo as any).cookieList,
				cookieObject: (global.userInfo as any).cookieObject
			}
		};

		await next();
	},
	set: async (ctx: Context, next: Next) => {
		(ctx.request as any).cookies = global.userInfo.cookie;
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
