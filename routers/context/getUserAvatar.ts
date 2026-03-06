import { Context, Next } from 'koa';
import { getUserAvatar } from '../../module';

// 获取 QQ 用户头像
export default async (ctx: Context, next: Next) => {
  const { k, uin, size = 140 } = ctx.query;

  if (!k && !uin) {
    ctx.status = 400;
    ctx.body = {
      error: '缺少 k 或 uin 参数'
    };
    return;
  }

  try {
    const result = await getUserAvatar({
      k: k as string,
      uin: uin as string,
      size: Number(size)
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

