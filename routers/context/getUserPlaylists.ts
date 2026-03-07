import { Context, Next } from 'koa';
import { getUserPlaylists } from '../../module';

// 获取用户创建的歌单
export default async (ctx: Context, next: Next) => {
  const { uin, offset = 0, limit = 30 } = ctx.query;

  if (!uin) {
    ctx.status = 400;
    ctx.body = {
      error: '缺少 uin 参数'
    };
    return;
  }

  const { status, body } = await getUserPlaylists({
    uin: uin as string,
    offset: Number(offset),
    limit: Number(limit)
  });

  Object.assign(ctx, {
    status,
    body
  });

  await next();
};

