import { KoaContext, Controller } from '../types';
import { getTopLists } from '../../module';

const controller: Controller = async (ctx, next) => {
  const props = {
    method: 'get',
    params: {},
    option: {}
  };
  
  const { status, body } = await getTopLists(props);
  Object.assign(ctx, {
    status,
    body
  });
};

export default controller;
