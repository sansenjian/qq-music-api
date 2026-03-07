import { KoaContext, Controller } from '../types';
import { UCommon } from '../../module';

const controller: Controller = async (ctx, next) => {
	const { songs } = ctx.request.body || {};

  const params = Object.assign({
    format: 'json',
    inCharset: 'utf8',
    outCharset: 'utf-8',
    notice: 0,
    platform: 'yqq.json',
    needNewCode: 0
  });

  const props = {
    method: 'get',
    option: {},
    params
  };

  const data = await Promise.all(
    (songs || []).map(async (song: any[]) => {
      const [song_mid, song_id = ''] = song;
      return await UCommon({
        ...props,
        params: {
          ...params,
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
        }
      }).then(res => res.data);
    })
  );
  
  Object.assign(ctx, {
    status: 200,
    body: {
      response: {
        code: 0,
        data
      }
    }
  });
};

export default controller;
