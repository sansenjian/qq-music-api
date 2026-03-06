import { KoaContext, Controller } from '../types';

const controller: Controller = async (ctx, next) => {
  const { albummid } = ctx.query;
  
  const props = {
    method: 'get',
    params: {
      albummid
    },
    option: {}
  };
  
  if (albummid) {
    const { status, body } = await (require('../../module').getAlbumInfo)(props);
    Object.assign(ctx, {
      status,
      body
    });
  } else {
    ctx.status = 400;
    ctx.body = {
      data: {
        message: 'no albummid'
      }
    };
  }
};

export default controller;
