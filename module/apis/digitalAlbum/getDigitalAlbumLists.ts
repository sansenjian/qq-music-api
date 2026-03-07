import request from '../../../util/request';
import { handleApi } from '../../../util/apiResponse';
import type { ApiOptions } from '../../../types/api';

export default async ({ method = 'get', params = {}, option = {} }: ApiOptions) => {
  const data = Object.assign(params, {
    format: 'json',
    outCharset: 'utf-8',
    cmd: 'pc_index_new'
  });
  
  const options = Object.assign(option, {
    params: data
  });
  
  return handleApi(
    request({
      url: '/v8/fcg-bin/musicmall.fcg',
      method: method as import('axios').Method,
      options
    })
  );
};
