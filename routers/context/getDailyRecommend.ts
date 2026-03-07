import { Context } from 'koa'
import recommendApi from '../../module/apis/recommend/getDailyRecommend'

/**
 * 获取每日推荐歌曲
 */
export async function getDailyRecommendController(ctx: Context) {
  const { cookie } = ctx.query

  const result = await recommendApi.getDailyRecommend(cookie as string)

  ctx.status = result.status
  ctx.body = result.body
}

/**
 * 获取私人 FM
 */
export async function getPrivateFMController(ctx: Context) {
  const { cookie } = ctx.query

  const result = await recommendApi.getPrivateFM(cookie as string)

  ctx.status = result.status
  ctx.body = result.body
}

/**
 * 获取新歌速递
 */
export async function getNewSongsController(ctx: Context) {
  const { areaId = '5', limit = '20' } = ctx.query

  const result = await recommendApi.getNewSongs(Number(areaId), Number(limit))

  ctx.status = result.status
  ctx.body = result.body
}

export default {
  getDailyRecommend: getDailyRecommendController,
  getPrivateFM: getPrivateFMController,
  getNewSongs: getNewSongsController
}
