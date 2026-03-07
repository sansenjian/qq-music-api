import { KoaContext, Controller } from '../types';
import { songListDetail } from '../../module';

const controller: Controller = async (ctx, next) => {
  const { disstid } = ctx.query;
  
  const props = {
    method: 'get',
    params: {
      disstid
    },
    option: {}
  };
  
  const { status, body } = await songListDetail(props);
  Object.assign(ctx, {
    status,
    body
  });
};

export default controller;
