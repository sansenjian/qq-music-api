import { KoaContext } from '../types';
import { UCommon } from '../../module';
import { setApiResponse, withErrorHandler } from '../util';
import { customResponse } from '../../util/apiResponse';

const batchGetSongInfoController = withErrorHandler(async (ctx: KoaContext) => {
  const { songs } = ctx.request.body || {};

  const params = {
    format: 'json',
    inCharset: 'utf8',
    outCharset: 'utf-8',
    notice: 0,
    platform: 'yqq.json',
    needNewCode: 0
  };

  const props = {
    method: 'get',
    option: {},
    params
  };

  const data = await Promise.all(
    (songs || []).map(async (song: any[]) => {
      const [song_mid, song_id = ''] = song;
      const response = await UCommon({
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
      });
      return response.data;
    })
  );
  
  setApiResponse(ctx, customResponse({ response: { code: 0, data } }, 200));
});

export default batchGetSongInfoController;
