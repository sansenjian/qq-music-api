import { KoaContext, Controller } from '../types';
import { getQQLoginQr } from '../../module';

const controller: Controller = async (ctx, next) => {
  const props = {
    method: 'get'
  };
  
  const { status, body } = await getQQLoginQr(props);
  Object.assign(ctx, {
    status,
    body
  });
};

export default controller;
