import { KoaContext } from '../types';
import { UCommon } from '../../module';
import { setApiResponse, withErrorHandler } from '../util';
import { customResponse } from '../../util/apiResponse';

const getSingerListController = withErrorHandler(async (ctx: KoaContext) => {
  const { area = -100, sex = -100, genre = -100, index = -100, page = 1 } = ctx.query;

  const pageNum = Number(page);
  const data = {
    comm: {
      ct: 24,
      cv: 0
    },
    singerList: {
      module: 'Music.SingerListServer',
      method: 'get_singer_list',
      param: {
        area: Number(area),
        sex: Number(sex),
        genre: Number(genre),
        index: Number(index),
        sin: (pageNum - 1) * 80,
        cur_page: pageNum
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
  
  const response = await UCommon(props);
  setApiResponse(ctx, customResponse({ response: response.data }, 200));
});

export default getSingerListController;
