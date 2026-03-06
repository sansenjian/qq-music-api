import { KoaContext, Controller } from '../types';

const controller: Controller = async (ctx, next) => {
  const { singermid: singer_mid } = ctx.query;
  
  const props = {
    method: 'get',
    params: {
      singer_mid
    },
    option: {}
  };
  
  if (singer_mid) {
    const { status, body } = await (require('../../module').getSimilarSinger)(props);
    Object.assign(ctx, {
      status,
      body
    });
  } else {
    ctx.status = 400;
    ctx.body = {
      response: 'no singermid'
    };
  }
};

export default controller;
