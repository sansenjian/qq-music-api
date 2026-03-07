import { Context, Next } from 'koa';

// Define the shape of global.userInfo
declare global {
  var userInfo: {
    cookie?: string;
    cookieList?: string[];
    loginUin?: string;
  };
}

const SAFE_COOKIE_NAMES = new Set(['qqmusic_key', 'qqmusic_uin']);

const cookieMiddleware = () => async (ctx: Context, next: Next) => {
	if (global.userInfo?.cookie) {
    // Extend Request interface if needed, or just cast
		(ctx.request as any).cookie = global.userInfo.cookie;
	}

	if (Array.isArray(global.userInfo?.cookieList)) {
		global.userInfo.cookieList.forEach((cookie: string) => {
			const [key, ...valueParts] = cookie.split('=');
        const normalizedKey = key?.trim();
        const value = valueParts.join('=').trim();

			if (normalizedKey && value && SAFE_COOKIE_NAMES.has(normalizedKey)) {
				ctx.cookies.set(normalizedKey, value, {
					// 仅同步前端业务必需且可公开的 Cookie，避免敏感登录态透传
					overwrite: true,
            httpOnly: false,
            sameSite: 'lax'
				});
			}
		});
	}

	await next();
};

export default cookieMiddleware;
