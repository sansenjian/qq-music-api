import { KoaContext } from '../types';
import { UCommon } from '../../module';
import { setApiResponse, withErrorHandler } from '../util';
import { customResponse } from '../../util/apiResponse';

const getSingerHotsongController = withErrorHandler(async (ctx: KoaContext) => {
  const singermid = ctx.query.singermid as string;
  const num = +ctx.query.limit || 5;
  const page = +ctx.query.page || 0;
  
  const data = {
    comm: {
      ct: 24,
      cv: 0
    },
    singer: {
      method: 'get_singer_detail_info',
      param: {
        sort: 5,
        singermid,
        sin: (page - 1) * num,
        num
      },
      module: 'music.web_singer_info_svr'
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

export default getSingerHotsongController;
