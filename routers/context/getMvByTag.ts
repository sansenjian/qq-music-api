import { KoaContext, Controller } from '../types';

const controller: Controller = async (ctx, next) => {
  const props = {
    method: 'get',
    params: {},
    option: {}
  };
  
  const { status, body } = await (require('../../module').getMvByTag)(props);
  Object.assign(ctx, {
    status,
    body
  });
};

export default controller;
