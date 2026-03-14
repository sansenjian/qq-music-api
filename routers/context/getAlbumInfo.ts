import { KoaContext } from '../types';
import { getAlbumInfo } from '../../module';
import { setApiResponse, withErrorHandler } from '../util';
import { errorResponse } from '../../util/apiResponse';

const getAlbumInfoController = withErrorHandler(async (ctx: KoaContext) => {
  const { albummid } = ctx.query;
  
  const props = {
    method: 'get',
    params: {
      albummid
    },
    option: {}
  };
  
  if (!albummid) {
    setApiResponse(ctx, errorResponse('no albummid', 400));
    return;
  }
  
  const result = await getAlbumInfo(props);
  setApiResponse(ctx, result);
});

export default getAlbumInfoController;
