import type { Context } from 'koa';
import serviceConfig from '../config/service-config';

type CookieSource =
  | 'query'
  | 'x-custom-cookie'
  | 'header-cookie'
  | 'request'
  | 'global'
  | 'none';

interface ResolveCookieOptions {
  fallbackMode?: boolean;
  useGlobalCookie?: boolean;
  cookieParamName?: string;
}

interface ResolvedCookie {
  cookie?: string;
  source: CookieSource;
}

const normalizeCookieValue = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    return normalizeCookieValue(value[0]);
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  return normalized ? normalized : undefined;
};

export const extractUinFromCookie = (cookie?: string): string | undefined => {
  if (!cookie) return undefined;
  const match = cookie.match(/(?:^|;\s*)uin=([^;]+)/);
  return match?.[1];
};

export const setRequestCookieContext = (ctx: Context, cookie?: string) => {
  if (!cookie) return;
  (ctx.request as any).cookie = cookie;
  (ctx.state as any).requestCookie = cookie;
};

export const resolveRequestCookie = (
  ctx: Context,
  options: ResolveCookieOptions = {}
): ResolvedCookie => {
  const fallbackMode = options.fallbackMode ?? serviceConfig.fallbackMode;
  const useGlobalCookie = options.useGlobalCookie ?? false;
  const cookieParamName = options.cookieParamName ?? serviceConfig.cookieParamName;

  if (fallbackMode) {
    const queryCookie = normalizeCookieValue((ctx.query as Record<string, unknown>)[cookieParamName]);
    if (queryCookie) {
      return { cookie: queryCookie, source: 'query' };
    }

    const customHeaderCookie = normalizeCookieValue(ctx.headers['x-custom-cookie']);
    if (customHeaderCookie) {
      return { cookie: customHeaderCookie, source: 'x-custom-cookie' };
    }

    const headerCookie = normalizeCookieValue(ctx.headers.cookie);
    if (headerCookie) {
      return { cookie: headerCookie, source: 'header-cookie' };
    }
  }

  const requestCookie = normalizeCookieValue((ctx.request as any).cookie);
  if (requestCookie) {
    return { cookie: requestCookie, source: 'request' };
  }

  if (useGlobalCookie) {
    const globalCookie = normalizeCookieValue(global.userInfo?.cookie);
    if (globalCookie) {
      return { cookie: globalCookie, source: 'global' };
    }
  }

  return { source: 'none' };
};
