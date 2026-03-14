import { Context, Next } from 'koa';
import serviceConfig from '../config/service-config';
import { resolveRequestCookie, setRequestCookieContext } from '../util/cookieResolver';

/**
 * 降级模式中间件：支持通过 query/header 手动传递 Cookie。
 */
const fallbackMiddleware = () => async (ctx: Context, next: Next) => {
  if (!serviceConfig.fallbackMode) {
    await next();
    return;
  }

  const { cookie, source } = resolveRequestCookie(ctx, {
    fallbackMode: true,
    useGlobalCookie: false,
    cookieParamName: serviceConfig.cookieParamName
  });

  if (cookie) {
    setRequestCookieContext(ctx, cookie);

    if (process.env.DEBUG === 'true') {
      console.log(`[FallbackMode] use cookie from ${source}, length: ${cookie.length}`);
    }
  }

  await next();
};

export default fallbackMiddleware;

