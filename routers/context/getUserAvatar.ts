import { KoaContext } from '../types';
import { getUserAvatar } from '../../module';
import { setApiResponse, withErrorHandler } from '../util';
import { customResponse, errorResponse } from '../../util/apiResponse';

// 获取 QQ 用户头像
const getUserAvatarController = withErrorHandler(async (ctx: KoaContext) => {
  const rawK = Array.isArray(ctx.query.k) ? ctx.query.k[0] : ctx.query.k;
  const rawUin = Array.isArray(ctx.query.uin) ? ctx.query.uin[0] : ctx.query.uin;
  const rawSize = Array.isArray(ctx.query.size) ? ctx.query.size[0] : ctx.query.size;
  const parsedSize = rawSize ? Number(rawSize) : 140;

  if (!rawK && !rawUin) {
    setApiResponse(ctx, errorResponse('缺少 k 或 uin 参数', 400));
    return;
  }

  if (!Number.isFinite(parsedSize) || parsedSize <= 0) {
    setApiResponse(ctx, errorResponse('size 参数无效', 400));
    return;
  }

  const result = await getUserAvatar({
    k: rawK,
    uin: rawUin,
    size: parsedSize
  });

  setApiResponse(ctx, customResponse({
    response: {
      code: 0,
      data: {
        avatarUrl: result.avatarUrl,
        message: '获取头像成功'
      }
    }
  }, 200));
});

export default getUserAvatarController;

