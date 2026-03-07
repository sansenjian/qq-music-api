import type { ApiFunction, ApiOptions } from '../../../types/api';
import { customResponse, errorResponse } from '../../../util/apiResponse';
import { hash33 } from '../../../util/loginUtils';

const getQQLoginQr: ApiFunction = async ({ method = 'get', params = {}, option = {} }: ApiOptions) => {
  try {
    const url =
      'https://ssl.ptlogin2.qq.com/ptqrshow?appid=716027609&e=2&l=M&s=3&d=72&v=4&t=0.9698127522807933&daid=383&pt_3rd_aid=100497308&u1=https%3A%2F%2Fgraph.qq.com%2Foauth2.0%2Flogin_jump';

    const response = await fetch(url);
    const data = await response.arrayBuffer();
    const img = 'data:image/png;base64,' + (data && Buffer.from(data).toString('base64'));
    const cookieHeader = response.headers.get('Set-Cookie');
    const match = cookieHeader?.match(/qrsig=([^;]+)/);

    if (!match) {
      return errorResponse('Failed to get qrsig from response', 502);
    }

    const qrsig = match[1];

    return customResponse({ img, ptqrtoken: hash33(qrsig), qrsig }, 200);
  } catch (error) {
    return errorResponse('Failed to fetch QQ login QR', 502);
  }
};

export default getQQLoginQr;
