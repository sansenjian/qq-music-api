import { KoaContext } from '../types';
import { UCommon } from '../../module';
import { setApiResponse, withErrorHandler } from '../util';
import { customResponse } from '../../util/apiResponse';

const getMvPlayController = withErrorHandler(async (ctx: KoaContext) => {
  const { vid } = ctx.query;
  
  if (!vid) {
    setApiResponse(ctx, {
      status: 400,
      body: {
        response: 'vid is null'
      }
    });
    return;
  }
  
  const data = {
    comm: {
      ct: 24,
      cv: 4747474
    },
    getMVUrl: {
      module: 'gosrf.Stream.MvUrlProxy',
      method: 'GetMvUrls',
      param: {
        vids: [vid],
        request_typet: 10001
      }
    },
    mvinfo: {
      module: 'video.VideoDataServer',
      method: 'get_video_info_batch',
      param: {
        vidlist: [vid],
        required: [
          'vid', 'type', 'sid', 'cover_pic', 'duration', 'singers',
          'video_switch', 'msg', 'name', 'desc', 'playcnt', 'pubdate',
          'isfav', 'gmid'
        ]
      }
    },
    other: {
      module: 'video.VideoLogicServer',
      method: 'rec_video_byvid',
      param: {
        vid,
        required: [
          'vid', 'type', 'sid', 'cover_pic', 'duration', 'singers',
          'video_switch', 'msg', 'name', 'desc', 'playcnt', 'pubdate',
          'isfav', 'gmid', 'uploader_headurl', 'uploader_nick',
          'uploader_encuin', 'uploader_uin', 'uploader_hasfollow',
          'uploader_follower_num'
        ],
        support: 1
      }
    }
  };
  
  const params = {
    format: 'json',
    data: JSON.stringify(data)
  };
  
  const props = {
    method: 'get',
    params,
    option: {}
  };
  
  const response = await UCommon(props);
  const mvurls = response.data?.getMVUrl?.data;
  
  if (!mvurls || typeof mvurls !== 'object' || Object.keys(mvurls).length === 0) {
    setApiResponse(ctx, {
      status: 502,
      body: {
        response: {
          data: null,
          error: 'Failed to get MV URL data'
        }
      }
    });
    return;
  }
  
  const mvurlskey = Object.keys(mvurls)[0];
  const mp4_urls = mvurls[mvurlskey]?.mp4?.map((item: any) => item.freeflow_url) || [];
  const hls_urls = mvurls[mvurlskey]?.hls?.map((item: any) => item.freeflow_url) || [];
  const urls = [...mp4_urls, ...hls_urls];
  
  let play_urls: string[] = [];
  const playLists: Record<string, string[]> = {
    f10: [],
    f20: [],
    f30: [],
    f40: []
  };
  
  if (urls.length) {
    urls.forEach((url: string[]) => {
      play_urls = [...play_urls, ...url];
    });
    playLists.f10 = play_urls.filter((item: string) => /\.f10\.mp4/.test(item));
    playLists.f20 = play_urls.filter((item: string) => /\.f20\.mp4/.test(item));
    playLists.f30 = play_urls.filter((item: string) => /\.f30\.mp4/.test(item));
    playLists.f40 = play_urls.filter((item: string) => /\.f40\.mp4/.test(item));
  }
  
  response.data.playLists = playLists;
  setApiResponse(ctx, customResponse({ response: response.data }, 200));
});

export default getMvPlayController;
