import { KoaContext, Controller } from '../types';

const controller: Controller = async (ctx, next) => {
  const { limit = 20, page = 0, sortId = 5, categoryId = 10000000 } = ctx.query;
  
  const sin = +page * +limit;
  const ein = +limit * (+page + 1) - 1;
  
  const params = Object.assign({
    categoryId,
    sortId,
    sin,
    ein
  });
  
  const props = {
    method: 'get',
    params,
    option: {}
  };
  
  const { status, body } = await (require('../../module').songLists)(props);
  Object.assign(ctx, {
    status,
    body
  });
};

export default controller;
