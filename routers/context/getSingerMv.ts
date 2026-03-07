import { KoaContext, Controller } from '../types';
import { getSingerMv } from '../../module';

const controller: Controller = async (ctx, next) => {
  const { singermid, order, num = 5 } = ctx.query;
  
  const orderStr = Array.isArray(order) ? order[0] : order;
  
  let params: Record<string, any> = Object.assign({
    singermid,
    order: orderStr,
    num
  });
  
  if (orderStr && orderStr.toLowerCase() === 'time') {
    params = Object.assign(params, {
      cmd: 1
    });
  }
  
  const props = {
    method: 'get',
    params,
    option: {}
  };
  
  if (singermid) {
    const { status, body } = await getSingerMv(props);
    Object.assign(ctx, {
      status,
      body
    });
  } else {
    ctx.status = 400;
    ctx.body = {
      response: 'no singermid'
    };
  }
};

export default controller;
