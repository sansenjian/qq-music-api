import { KoaContext } from '../types';
import { UCommon } from '../../module';
import { setApiResponse, withErrorHandler } from '../util';
import { customResponse } from '../../util/apiResponse';

const getMvController = withErrorHandler(async (ctx: KoaContext) => {
  const { area_id = 15, version_id = 7, limit = 20, page = 0 } = ctx.query;
  const start = (+page ? +page - 1 : 0) * +limit;
  
  const data = {
    comm: {
      ct: 24
    },
    mv_tag: {
      module: 'MvService.MvInfoProServer',
      method: 'GetAllocTag',
      param: {}
    },
    mv_list: {
      module: 'MvService.MvInfoProServer',
      method: 'GetAllocMvInfo',
      param: {
        start,
        limit: +limit,
        version_id,
        area_id,
        order: 1
      }
    }
  };
  
  const params = {
    format: 'json',
    data: JSON.stringify(data)
  };
  
  const props = {
    method: 'get',
    params,
    option: {}
  };
  
  if (!version_id || !area_id) {
    setApiResponse(ctx, {
      status: 400,
      body: {
        response: 'version_id or area_id is null'
      }
    });
    return;
  }
  
  const response = await UCommon(props);
  setApiResponse(ctx, customResponse({ response: response.data }, 200));
});

export default getMvController;
