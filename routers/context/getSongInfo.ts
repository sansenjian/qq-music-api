import { KoaContext, Controller } from '../types';

const controller: Controller = async (ctx, next) => {
  const song_mid = ctx.query.songmid as string;
  const song_id = ctx.query.songid || '';

  const params = Object.assign({
    format: 'json',
    inCharset: 'utf8',
    outCharset: 'utf-8',
    notice: 0,
    platform: 'yqq.json',
    needNewCode: 0,
    data: {
      comm: {
        ct: 24,
        cv: 0
      },
      songinfo: {
        method: 'get_song_detail_yqq',
        param: {
          song_type: 0,
          song_mid,
          song_id
        },
        module: 'music.pf_song_detail_svr'
      }
    }
  });
  
  const props = {
    method: 'get',
    params,
    option: {}
  };

  await (require('../../module').UCommon)(props)
    .then(res => {
      const response = res.data;
      ctx.status = 200;
      ctx.body = {
        response
      };
    })
    .catch(error => {
      console.log('error', error);
    });
};

export default controller;
