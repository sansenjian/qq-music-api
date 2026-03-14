import { Context } from 'koa';
import recommendApi from '../../module/apis/recommend/getDailyRecommend';
import { resolveRequestCookie } from '../../util/cookieResolver';

export async function getDailyRecommendController(ctx: Context) {
  const { cookie } = resolveRequestCookie(ctx);
  const result = await recommendApi.getDailyRecommend(cookie);

  ctx.status = result.status;
  ctx.body = result.body;
}

export async function getPrivateFMController(ctx: Context) {
  const { cookie } = resolveRequestCookie(ctx);
  const result = await recommendApi.getPrivateFM(cookie);

  ctx.status = result.status;
  ctx.body = result.body;
}

export async function getNewSongsController(ctx: Context) {
  const { areaId = '5', limit = '20' } = ctx.query;
  const result = await recommendApi.getNewSongs(Number(areaId), Number(limit));

  ctx.status = result.status;
  ctx.body = result.body;
}

export default {
  getDailyRecommend: getDailyRecommendController,
  getPrivateFM: getPrivateFMController,
  getNewSongs: getNewSongsController
};

