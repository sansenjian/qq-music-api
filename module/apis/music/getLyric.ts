import { lyricParse } from '../../../util/lyricParse';
import request from '../../../util/request';
import { handleApi } from '../../../util/apiResponse';
import type { ApiOptions } from '../../../types/api';

export default async ({ method = 'get', params = {}, option = {}, isFormat = false }: ApiOptions) => {
  const data = Object.assign(params, {
    format: 'json',
    outCharset: 'utf-8',
    pcachetime: Date.now()
  });
  
  const options = Object.assign(option, {
    params: data
  });
  
  return handleApi(
    request({
      url: '/lyric/fcgi-bin/fcg_query_lyric_new.fcg',
      method: method as import('axios').Method,
      options
    }),
    {
      transformData: (resData: Record<string, any>) => {
        const lyricString = resData && resData.lyric && Buffer.from(resData.lyric, 'base64').toString();
        const lyric = isFormat && lyricString ? lyricParse(lyricString) : lyricString;
        return {
          ...resData,
          lyric
        };
      }
    }
  );
};
