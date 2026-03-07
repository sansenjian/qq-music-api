import { Context } from 'koa'
import extendApi from '../../module/apis/extend/getPlaylistTags'

/**
 * 获取歌单标签列表
 */
export async function getPlaylistTagsController(ctx: Context) {
  const result = await extendApi.getPlaylistTags()
  
  ctx.status = result.status
  ctx.body = result.body
}

/**
 * 根据标签获取歌单列表
 */
export async function getPlaylistsByTagController(ctx: Context) {
  const { tagId = '1', page = '0', num = '20' } = ctx.query

  const result = await extendApi.getPlaylistsByTag(Number(tagId), Number(page), Number(num))
  
  ctx.status = result.status
  ctx.body = result.body
}

/**
 * 获取热门评论
 */
export async function getHotCommentsController(ctx: Context) {
  const { id, type = '1', page = '0', pagesize = '20' } = ctx.query

  if (!id) {
    ctx.status = 400
    ctx.body = {
      code: -1,
      msg: '缺少参数 id（资源 ID）',
      data: null
    }
    return
  }

  const result = await extendApi.getHotComments(id as string, Number(type), Number(page), Number(pagesize))
  
  ctx.status = result.status
  ctx.body = result.body
}

/**
 * 获取歌手分类列表
 */
export async function getSingerListByAreaController(ctx: Context) {
  const { area = '-1', sex = '-1', genre = '-1', page = '1', pagesize = '80' } = ctx.query

  const result = await extendApi.getSingerListByArea(
    Number(area),
    Number(sex),
    Number(genre),
    Number(page),
    Number(pagesize)
  )
  
  ctx.status = result.status
  ctx.body = result.body
}

export default {
  getPlaylistTags: getPlaylistTagsController,
  getPlaylistsByTag: getPlaylistsByTagController,
  getHotComments: getHotCommentsController,
  getSingerListByArea: getSingerListByAreaController
}
