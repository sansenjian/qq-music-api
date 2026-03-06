import { KoaContext, Controller } from '../types';
import { getLyric } from '../../module';

const controller: Controller = async (ctx, next) => {
  const songmid = Array.isArray(ctx.query.songmid) ? ctx.query.songmid[0] : ctx.query.songmid;
  const rawIsFormat = Array.isArray(ctx.query.isFormat) ? ctx.query.isFormat[0] : ctx.query.isFormat;
  
  const props = {
    method: 'get',
    params: {
      songmid
    },
    option: {},
    isFormat: rawIsFormat
  };
  
  if (songmid) {
    const { status, body } = await getLyric(props);
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

