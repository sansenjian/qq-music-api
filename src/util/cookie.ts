import { Context, Next, Middleware } from 'koa';
import type { UserInfo } from '../types/global';
import serviceConfig from '../config/service-config';
import { getUserInfo } from '../config/user-info-store';
import { resolveRequestCookie, setRequestCookieContext } from './cookieResolver';

declare global {
  var userInfo: UserInfo;
}

const SAFE_COOKIE_NAMES = new Set(['qqmusic_key', 'qqmusic_uin']);

interface CookieMiddlewareOptions {
  fallbackMode?: boolean;
  useGlobalCookie?: boolean;
  cookieParamName?: string;
}

const cookieMiddleware = (options: CookieMiddlewareOptions = {}): Middleware => async (ctx: Context, next: Next) => {
  const useFallback = options.fallbackMode ?? serviceConfig.fallbackMode;
  const useGlobal = options.useGlobalCookie ?? serviceConfig.useGlobalCookie;
  const cookieParamName = options.cookieParamName ?? serviceConfig.cookieParamName;

  const { cookie } = resolveRequestCookie(ctx, {
    fallbackMode: useFallback,
    useGlobalCookie: useGlobal,
    cookieParamName,
  });

  if (cookie) {
    setRequestCookieContext(ctx, cookie);
  }

  const userInfo = getUserInfo();

  if (useGlobal && Array.isArray(userInfo.cookieList)) {
    userInfo.cookieList.forEach((cookieItem: string) => {
      const [key, ...valueParts] = cookieItem.split('=');
      const normalizedKey = key?.trim();
      const value = valueParts.join('=').trim();

      if (normalizedKey && value && SAFE_COOKIE_NAMES.has(normalizedKey)) {
        ctx.cookies.set(normalizedKey, value, {
          overwrite: true,
          httpOnly: false,
          sameSite: 'lax',
        });
      }
    });
  }

  await next();
};

export default cookieMiddleware;
