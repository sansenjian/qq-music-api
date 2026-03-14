import { Context } from 'koa';
import recommendApi from '../../module/apis/recommend/getPersonalRecommend';
import { resolveRequestCookie } from '../../util/cookieResolver';
import { errorResponse } from '../../util/apiResponse';

export async function getPersonalRecommendController(ctx: Context) {
  const { type = '1' } = ctx.query;
  const rawType = Array.isArray(type) ? type[0] : type;
  const { cookie } = resolveRequestCookie(ctx);
  const result = await recommendApi.getPersonalRecommend(Number(rawType), cookie);

  ctx.status = result.status;
  ctx.body = result.body;
}

export async function getSimilarSongsController(ctx: Context) {
  const { songmid } = ctx.query;

  if (!songmid) {
    const result = errorResponse('缺少参数 songmid', 400);
    ctx.status = result.status;
    ctx.body = result.body;
    return;
  }

  const validSongmid = Array.isArray(songmid) ? songmid[0] : songmid;
  if (!validSongmid || String(validSongmid).trim() === '') {
    const result = errorResponse('参数 songmid 不能为空', 400);
    ctx.status = result.status;
    ctx.body = result.body;
    return;
  }

  const { cookie } = resolveRequestCookie(ctx);
  const result = await recommendApi.getSimilarSongs(String(validSongmid), cookie);

  ctx.status = result.status;
  ctx.body = result.body;
}

export default {
  getPersonalRecommend: getPersonalRecommendController,
  getSimilarSongs: getSimilarSongsController
};
