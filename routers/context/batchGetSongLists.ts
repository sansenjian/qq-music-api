import { KoaContext } from '../types';
import { songLists } from '../../module';
import { setApiResponse, withErrorHandler } from '../util';
import { customResponse } from '../../util/apiResponse';

const batchGetSongListsController = withErrorHandler(async (ctx: KoaContext) => {
  const { limit: ein = 19, page: sin = 0, sortId = 5, categoryIds = [10000000] } = ctx.request.body || {};

  const params = {
    sortId,
    sin,
    ein
  };

  const props = {
    method: 'get',
    option: {},
    params
  };

  const data = await Promise.all(
    categoryIds.map(
      async (categoryId: number) => {
        const result = await songLists({
          ...props,
          params: {
            ...params,
            categoryId
          }
        });
        if (result.body.response && +result.body.response.code === 0) {
          return result.body.response.data;
        } else {
          return result.body.response;
        }
      }
    )
  );
  
  setApiResponse(ctx, customResponse({ status: 200, data }, 200));
});

export default batchGetSongListsController;
