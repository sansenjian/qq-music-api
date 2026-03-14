import { KoaContext } from '../types';
import { UCommon } from '../../module';
import { setApiResponse, withErrorHandler } from '../util';
import { customResponse } from '../../util/apiResponse';

const getSongInfoController = withErrorHandler(async (ctx: KoaContext) => {
  const song_mid = ctx.query.songmid as string;
  const song_id = ctx.query.songid || '';

  const params = {
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
  };
  
  const props = {
    method: 'get',
    params,
    option: {}
  };

  const response = await UCommon(props);
  setApiResponse(ctx, customResponse({ response: response.data }, 200));
});

export default getSongInfoController;
