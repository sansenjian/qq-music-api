import { Context } from 'koa'
import recommendApi from '../../module/apis/recommend/getPersonalRecommend'

/**
 * 获取个性化推荐
 */
export async function getPersonalRecommendController(ctx: Context) {
  const { type = '1', cookie } = ctx.query

  const result = await recommendApi.getPersonalRecommend(Number(type), cookie as string)

  ctx.status = result.status
  ctx.body = result.body
}

/**
 * 获取相似歌曲
 */
export async function getSimilarSongsController(ctx: Context) {
  const { songmid, cookie } = ctx.query

  if (!songmid) {
    ctx.status = 400
    ctx.body = {
      code: -1,
      msg: '缺少参数 songmid',
      data: null
    }
    return
  }

  // 处理数组类型，取第一个值
  const validSongmid = Array.isArray(songmid) ? songmid[0] : songmid
  
  // 校验空字符串
  if (!validSongmid || String(validSongmid).trim() === '') {
    ctx.status = 400
    ctx.body = {
      code: -1,
      msg: '参数 songmid 不能为空',
      data: null
    }
    return
  }

  const result = await recommendApi.getSimilarSongs(String(validSongmid), cookie as string)

  ctx.status = result.status
  ctx.body = result.body
}

export default {
  getPersonalRecommend: getPersonalRecommendController,
  getSimilarSongs: getSimilarSongsController
}
