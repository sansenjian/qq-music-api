import { KoaContext } from '../types';
import { UCommon } from '../../module';
import { setApiResponse, withErrorHandler } from '../util';
import { customResponse } from '../../util/apiResponse';

const getRanksController = withErrorHandler(async (ctx: KoaContext) => {
  const getWeekNumber = (d: Date): number => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const topId = +ctx.query.topId || 4;
  const num = +ctx.query.limit || 20;
  const offset = +ctx.query.page || 0;
  
  const date = new Date();
  const week = getWeekNumber(date);
  const isoWeekYearVal = date.getFullYear();
  const period = `${isoWeekYearVal}_${week}`;

  const data = {
    comm: {
      ct: 24,
      cv: 4747474,
      format: 'json',
      inCharset: 'utf-8',
      needNewCode: 1,
      uin: 0
    },
    req_1: {
      module: 'musicToplist.ToplistInfoServer',
      method: 'GetDetail',
      param: {
        topId,
        offset,
        num,
        period
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

export default getRanksController;
