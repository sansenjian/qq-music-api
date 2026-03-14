import { Context, Next } from 'koa';
import type { UserInfo } from '../types/global';
import serviceConfig from '../config/service-config';
import { resolveRequestCookie, setRequestCookieContext } from './cookieResolver';

declare global {
  var userInfo: UserInfo;
}

const SAFE_COOKIE_NAMES = new Set(['qqmusic_key', 'qqmusic_uin']);

const cookieMiddleware = () => async (ctx: Context, next: Next) => {
  const { cookie } = resolveRequestCookie(ctx, {
    fallbackMode: serviceConfig.fallbackMode,
    useGlobalCookie: serviceConfig.useGlobalCookie,
    cookieParamName: serviceConfig.cookieParamName
  });

  if (cookie) {
    setRequestCookieContext(ctx, cookie);
  }

  if (serviceConfig.useGlobalCookie && Array.isArray(global.userInfo?.cookieList)) {
    global.userInfo.cookieList.forEach((cookieItem: string) => {
      const [key, ...valueParts] = cookieItem.split('=');
      const normalizedKey = key?.trim();
      const value = valueParts.join('=').trim();

      if (normalizedKey && value && SAFE_COOKIE_NAMES.has(normalizedKey)) {
        ctx.cookies.set(normalizedKey, value, {
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
