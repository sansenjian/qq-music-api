import request from '../../../util/request';
import { handleApi } from '../../../util/apiResponse';
import type { ApiOptions } from '../../../types/api';

export default async ({ method = 'get', params = {}, option = {} }: ApiOptions) => {
  const data = Object.assign(params, {
    format: 'json',
    outCharset: 'utf-8',
    cid: 205360581,
    begin: 0
  });
  
  const options = Object.assign(option, {
    params: data
  });
  
  return handleApi(
    request({
      url: '/mv/fcgi-bin/fcg_singer_mv.fcg',
      method,
      options
    })
  );
};
