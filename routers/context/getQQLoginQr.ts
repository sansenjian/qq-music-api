import { KoaContext, Controller } from '../types';

const controller: Controller = async (ctx, next) => {
  const props = {
    method: 'get'
  };
  
  const { status, body } = await (require('../../module').getQQLoginQr)(props);
  Object.assign(ctx, {
    status,
    body
  });
};

export default controller;
