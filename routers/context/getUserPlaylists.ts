import { Context, Next } from 'koa';
import { getUserPlaylists } from '../../module';
import { resolveRequestCookie } from '../../util/cookieResolver';

export default async (ctx: Context, next: Next) => {
  const { uin, offset = 0, limit = 30 } = ctx.query;

  if (!uin) {
    ctx.status = 400;
    ctx.body = {
      error: '缺少 uin 参数'
    };
    return;
  }

  const normalizedUin = Array.isArray(uin) ? uin[0] : uin;
  const { cookie } = resolveRequestCookie(ctx);

  const { status, body } = await getUserPlaylists({
    uin: String(normalizedUin),
    offset: Number(offset),
    limit: Number(limit),
    cookie
  });

  Object.assign(ctx, {
    status,
    body
  });

  await next();
};

