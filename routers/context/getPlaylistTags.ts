import { KoaContext } from '../types';
import extendApi from '../../module/apis/extend/getPlaylistTags';
import { setApiResponse, withErrorHandler } from '../util';
import { errorResponse } from '../../util/apiResponse';

/**
 * 获取歌单标签列表
 */
const getPlaylistTagsController = withErrorHandler(async (ctx: KoaContext) => {
  const result = await extendApi.getPlaylistTags();
  setApiResponse(ctx, result);
});

/**
 * 根据标签获取歌单列表
 */
const getPlaylistsByTagController = withErrorHandler(async (ctx: KoaContext) => {
  const { tagId = '1', page = '0', num = '20' } = ctx.query;

  const result = await extendApi.getPlaylistsByTag(Number(tagId), Number(page), Number(num));
  setApiResponse(ctx, result);
});

/**
 * 获取热门评论
 */
const getHotCommentsController = withErrorHandler(async (ctx: KoaContext) => {
  const { id, type = '1', page = '0', pagesize = '20' } = ctx.query;

  if (!id) {
    setApiResponse(ctx, errorResponse('缺少参数 id（资源 ID）', 400));
    return;
  }

  const result = await extendApi.getHotComments(id as string, Number(type), Number(page), Number(pagesize));
  setApiResponse(ctx, result);
});

/**
 * 获取歌手分类列表
 */
const getSingerListByAreaController = withErrorHandler(async (ctx: KoaContext) => {
  const { area = '-1', sex = '-1', genre = '-1', page = '1', pagesize = '80' } = ctx.query;

  const result = await extendApi.getSingerListByArea(
    Number(area),
    Number(sex),
    Number(genre),
    Number(page),
    Number(pagesize)
  );
  setApiResponse(ctx, result);
});

export {
  getPlaylistTagsController,
  getPlaylistsByTagController,
  getHotCommentsController,
  getSingerListByAreaController
};

export default {
  getPlaylistTags: getPlaylistTagsController,
  getPlaylistsByTag: getPlaylistsByTagController,
  getHotComments: getHotCommentsController,
  getSingerListByArea: getSingerListByAreaController
};
