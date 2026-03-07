import { KoaContext, Controller } from '../types';
import { getMvByTag } from '../../module';

const controller: Controller = async (ctx, next) => {
  const props = {
    method: 'get',
    params: {},
    option: {}
  };
  
  const { status, body } = await getMvByTag(props);
  Object.assign(ctx, {
    status,
    body
  });
};

export default controller;
