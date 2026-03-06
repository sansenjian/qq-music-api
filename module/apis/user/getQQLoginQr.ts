import { hash33 } from '../../../util/loginUtils';

export interface ApiOptions {
  method?: string;
  params?: Record<string, any>;
  option?: any;
}

export interface LoginQrResponse {
  status: number;
  body: {
    img?: string;
    ptqrtoken?: number;
    qrsig?: string;
    error?: string;
  };
}

export default async ({ method = 'get', params = {}, option = {} }: ApiOptions): Promise<LoginQrResponse> => {
  const url =
    'https://ssl.ptlogin2.qq.com/ptqrshow?appid=716027609&e=2&l=M&s=3&d=72&v=4&t=0.9698127522807933&daid=383&pt_3rd_aid=100497308&u1=https%3A%2F%2Fgraph.qq.com%2Foauth2.0%2Flogin_jump';
  
  const response = await fetch(url);
  const data = await response.arrayBuffer();
  const img = 'data:image/png;base64,' + (data && Buffer.from(data).toString('base64'));
  const cookieHeader = response.headers.get('Set-Cookie');
  const match = cookieHeader?.match(/qrsig=([^;]+)/);
  
  if (!match) {
    return { status: 502, body: { error: 'Failed to get qrsig from response' } };
  }
  
  const qrsig = match[1];

  return { status: 200, body: { img, ptqrtoken: hash33(qrsig), qrsig } };
};
