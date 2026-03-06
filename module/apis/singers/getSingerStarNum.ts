import request from '../../../util/request';
import { handleApi } from '../../../util/apiResponse';
import type { ApiOptions } from '../../../types/api';

export default async ({ method = 'get', params = {}, option = {} }: ApiOptions) => {
  const data = Object.assign(params, {
    format: 'json',
    outCharset: 'utf-8',
    utf8: 1,
    rnd: Date.now()
  });
  
  const options = Object.assign(option, {
    params: data
  });
  
  return handleApi(
    request({
      url: '/rsc/fcgi-bin/fcg_order_singer_getnum.fcg',
      method,
      options
    })
  );
};
