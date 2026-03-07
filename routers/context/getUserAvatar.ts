import { Context, Next } from 'koa';
import { getUserAvatar } from '../../module';

// 获取 QQ 用户头像
export default async (ctx: Context, next: Next) => {
  const rawK = Array.isArray(ctx.query.k) ? ctx.query.k[0] : ctx.query.k;
  const rawUin = Array.isArray(ctx.query.uin) ? ctx.query.uin[0] : ctx.query.uin;
  const rawSize = Array.isArray(ctx.query.size) ? ctx.query.size[0] : ctx.query.size;
  const parsedSize = rawSize ? Number(rawSize) : 140;

  if (!rawK && !rawUin) {
    ctx.status = 400;
    ctx.body = {
      error: '缺少 k 或 uin 参数'
    };
    return;
  }

  if (!Number.isFinite(parsedSize) || parsedSize <= 0) {
    ctx.status = 400;
    ctx.body = {
      error: 'size 参数无效'
    };
    return;
  }

  try {
    const result = await getUserAvatar({
      k: rawK,
      uin: rawUin,
      size: parsedSize
    });

    ctx.status = 200;
    ctx.body = {
      response: {
        code: 0,
        data: {
          avatarUrl: result.avatarUrl,
          message: '获取头像成功'
        }
      }
    };
  } catch (error) {
    ctx.status = 502;
    ctx.body = {
      error: (error as Error).message
    };
  }

  await next();
};

