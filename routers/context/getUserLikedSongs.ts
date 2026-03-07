import { Context, Next } from 'koa';
import { getUserLikedSongs } from '../../module';

// 获取用户喜欢的歌曲列表
export default async (ctx: Context, next: Next) => {
  const { uin, offset = 0, limit = 30 } = ctx.query;

  if (!uin) {
    ctx.status = 400;
    ctx.body = {
      error: '缺少 uin 参数'
    };
    return;
  }

  const { status, body } = await getUserLikedSongs({
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
