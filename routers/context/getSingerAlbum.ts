import { KoaContext } from '../types';
import { UCommon } from '../../module';
import { setApiResponse, withErrorHandler } from '../util';
import { customResponse } from '../../util/apiResponse';

const getSingerAlbumController = withErrorHandler(async (ctx: KoaContext) => {
  const singermid = ctx.query.singermid as string;
  const num = +ctx.query.limit || 5;
  const begin = +ctx.query.page || 0;
  
  const data = {
    comm: {
      ct: 24,
      cv: 0
    },
    singer: {
      method: 'GetAlbumList',
      param: {
        sort: 5,
        singermid,
        begin,
        num
      },
      module: 'music.musichallAlbum.AlbumListServer'
    }
  };
  
  const params = {
    format: 'json',
    singermid,
    data: JSON.stringify(data)
  };
  
  const props = {
    method: 'get',
    params,
    option: {}
  };
  
  if (!singermid) {
    setApiResponse(ctx, {
      status: 400,
      body: {
        response: 'no singermid'
      }
    });
    return;
  }
  
  const response = await UCommon(props);
  setApiResponse(ctx, customResponse({ response: response.data }, 200));
});

export default getSingerAlbumController;
