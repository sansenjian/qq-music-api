import { KoaContext, Controller } from '../types';

const controller: Controller = async (ctx, next) => {
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
  
  let date = new Date();
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
  
  const params = Object.assign({
    format: 'json',
    data: JSON.stringify(data)
  });
  
  const props = {
    method: 'get',
    params,
    option: {}
  };
  
  await (require('../../module').UCommon)(props)
    .then(res => {
      const response = res.data;
      ctx.status = 200;
      ctx.body = {
        response
      };
    })
    .catch(error => {
      console.log('error', error);
    });
};

export default controller;
