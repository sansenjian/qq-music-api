import { KoaContext } from '../routes/types';
import { songLists } from '../services';
import { setApiResponse, withErrorHandler } from './util';
import { customResponse } from '../util/apiResponse';

interface SongListResponse {
  code?: number | string;
  data?: unknown;
  [key: string]: unknown;
}

const isSongListResponse = (value: unknown): value is SongListResponse =>
  Boolean(value && typeof value === 'object');

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
        const response = result.body.response;
        if (isSongListResponse(response) && Number(response.code) === 0) {
          return response.data;
        } else {
          return response;
        }
      }
    )
  );

  setApiResponse(ctx, customResponse({ status: 200, data }, 200));
});

export default batchGetSongListsController;
