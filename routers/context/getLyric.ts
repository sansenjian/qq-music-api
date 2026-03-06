import { KoaContext, Controller } from '../types';

const controller: Controller = async (ctx, next) => {
  const { songmid, isFormat } = ctx.query;
  
  const props = {
    method: 'get',
    params: {
      songmid
    },
    option: {},
    isFormat
  };
  
  if (songmid) {
    const { status, body } = await (require('../../module').getLyric)(props);
    Object.assign(ctx, {
      status,
      body
    });
  } else {
    ctx.status = 400;
    ctx.body = {
      response: 'no songmid'
    };
  }
};

export default controller;
