import request from '../../../util/request';
import { handleApi } from '../../../util/apiResponse';
import type { ApiOptions } from '../../../types/api';

export default async ({ method = 'get', params = {}, option = {} }: ApiOptions) => {
  const data = Object.assign(params, {
    format: 'json',
    outCharset: 'GB2312',
    cmd: 'shoubo',
    lan: 'all'
  });
  
  const options = Object.assign(option, {
    params: data
  });
  
  return handleApi(
    request({
      url: '/mv/fcgi-bin/getmv_by_tag',
      method: method as import('axios').Method,
      options
    })
  );
};
