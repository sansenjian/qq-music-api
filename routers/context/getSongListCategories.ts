import { KoaContext } from '../types';
import { songListCategories } from '../../module';
import { setApiResponse, withErrorHandler } from '../util';

/**
 * @description: 歌单
 * 1 歌单类型
 * 2 所有歌单
 * 3 分类歌单
 * 4 歌单详情
 *
 */
const getSongListCategoriesController = withErrorHandler(async (ctx: KoaContext) => {
  const props = {
    method: 'get',
    params: {},
    option: {}
  };
  const result = await songListCategories(props);
  setApiResponse(ctx, result);
});

export default getSongListCategoriesController;
