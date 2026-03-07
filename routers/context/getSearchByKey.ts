import { KoaContext, Controller } from '../types';
import { getSearchByKey } from '../../module';

const controller: Controller = async (ctx, next) => {
  const w = ctx.query.key || ctx.params.key;
  const { limit: n, page: p, catZhida, remoteplace = 'song' } = ctx.query;
  
  const props = {
    method: 'get',
    params: {
      w,
      n: +n || 10,
      p: +p || 1,
      catZhida: +catZhida || 1,
      remoteplace: `txt.yqq.${remoteplace}`
    },
    option: {}
  };
  
  if (w) {
    const { status, body } = await getSearchByKey(props);
    Object.assign(ctx, {
      status,
      body
    });
  } else {
    ctx.status = 400;
    ctx.body = {
      response: 'search key is null'
    };
  }
};

export default controller;
