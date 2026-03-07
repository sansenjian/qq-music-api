import request from '../../../util/request';
import { handleApi } from '../../../util/apiResponse';
import type { ApiOptions } from '../../../types/api';

export default async ({ method = 'get', params = {}, option = {} }: ApiOptions) => {
  const data = Object.assign(params, {
    format: 'xml',
    outCharset: 'utf-8',
    utf8: 1,
    r: Date.now()
  });
  
  const options = Object.assign(option, {
    params: data
  });
  
  return handleApi(
    request({
      url: '/splcloud/fcgi-bin/fcg_get_singer_desc.fcg',
      method: method as import('axios').Method,
      options,
      isUUrl: 'c'
    })
  );
};
