import request from '../../../util/request';
import { handleApi } from '../../../util/apiResponse';
import type { ApiOptions } from '../../../types/api';

export default async ({ method = 'get', params = {}, option = {} }: ApiOptions) => {
  const data = Object.assign(params, {
    format: 'json',
    outCharset: 'utf-8',
    platform: 'h5',
    needNewCode: 1
  });
  
  const options = Object.assign(option, {
    params: data
  });
  
  return handleApi(
    request({
      url: '/v8/fcg-bin/fcg_myqq_toplist.fcg',
      method,
      options,
      isUUrl: 'c'
    }),
    {
      transformData: (response) => {
        if (typeof response === 'string') {
          const reg = /^\w+\(({[^()]+})\)$/;
          const matches = response.match(reg);
          if (matches) {
            return JSON.parse(matches[1]);
          }
        }
        return response;
      }
    }
  );
};
