import { KoaContext, Controller } from '../types';

const controller: Controller = async (ctx, next) => {
  const { id, size = '300x300', maxAge = 2592000 } = ctx.query;
  
  if (!id) {
    ctx.status = 400;
    ctx.body = {
      response: 'no id~~'
    };
    return;
  }
  
  const body = {
    response: {
      code: 0,
      data: {
        imageUrl: `https://y.gtimg.cn/music/photo_new/T002R${size}M000${id}.jpg?max_age=${maxAge}`
      }
    }
  };
  
  Object.assign(ctx, {
    status: 200,
    body
  });
};

export default controller;
