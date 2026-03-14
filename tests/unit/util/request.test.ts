const mockService = jest.fn();
const mockInterceptors = {
  request: { use: jest.fn() },
  response: { use: jest.fn() }
};
(mockService as jest.Mock & { interceptors: typeof mockInterceptors }).interceptors = mockInterceptors;

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => mockService)
  },
  create: jest.fn(() => mockService)
}));

import type { AxiosRequestConfig } from 'axios';
import request from '../../../util/request';

describe('request util', () => {
  beforeEach(() => {
    mockService.mockClear();

    global.userInfo = {
      loginUin: '123456',
      cookie: 'uin=o123456; qm_keyst=abc',
      cookieList: ['uin=o123456', 'qm_keyst=abc'],
      cookieObject: {
        uin: 'o123456',
        qm_keyst: 'abc'
      },
      refreshData: () => undefined
    };
  });

  const getLastConfig = (): AxiosRequestConfig => {
    expect(mockService).toHaveBeenCalled();
    const calls = mockService.mock.calls;
    return calls[calls.length - 1]?.[0] as AxiosRequestConfig;
  };

  const getRequestInterceptor = () => {
    const interceptor = mockInterceptors.request.use.mock.calls[0]?.[0] as
      | ((config: AxiosRequestConfig) => AxiosRequestConfig)
      | undefined;

    expect(interceptor).toBeDefined();
    return interceptor as (config: AxiosRequestConfig) => AxiosRequestConfig;
  };

  test('should use c.y.qq.com as default base URL', async () => {
    await request('/test-path');

    expect(getLastConfig().url).toBe('https://c.y.qq.com/test-path');
  });

  test('should use y.qq.com when isUUrl is y', async () => {
    await request({
      url: '/test-path',
      isUUrl: 'y'
    });

    expect(getLastConfig().url).toBe('https://y.qq.com/test-path');
  });

  test('should use raw url when isUUrl is u', async () => {
    await request({
      url: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
      isUUrl: 'u'
    });

    expect(getLastConfig().url).toBe('https://u.y.qq.com/cgi-bin/musicu.fcg');
  });

  test('should fallback to c.y.qq.com for unknown base type', async () => {
    await request('/fallback-path', 'GET', undefined, 'c');

    expect(getLastConfig().url).toBe('https://c.y.qq.com/fallback-path');
  });

  test('should not inject Cookie from global.userInfo when no cookie header is provided', async () => {
    await request({
      url: '/cookie-test',
      options: {
        headers: {}
      }
    });

    expect((getLastConfig().headers as Record<string, string>)?.Cookie).toBeUndefined();
  });

  test('should inject Cookie header from RequestConfig.cookie', async () => {
    await request({
      url: '/cookie-test',
      cookie: 'k=v'
    });

    expect((getLastConfig().headers as Record<string, string>)?.Cookie).toBe('k=v');
  });

  test('should inject Cookie header from customCookie argument in legacy signature', async () => {
    await request('/cookie-test', 'GET', { headers: {} }, 'c', 'k=v');

    expect((getLastConfig().headers as Record<string, string>)?.Cookie).toBe('k=v');
  });

  test('should keep explicit Cookie header when RequestConfig.cookie is also provided', async () => {
    await request({
      url: '/cookie-test',
      cookie: 'k=v',
      options: {
        headers: {
          Cookie: 'custom=value'
        }
      }
    });

    expect((getLastConfig().headers as Record<string, string>)?.Cookie).toBe('custom=value');
  });

  test('should preserve explicit Cookie header without overriding it', async () => {
    await request({
      url: '/cookie-test',
      options: {
        headers: {
          Cookie: 'custom=value'
        }
      }
    });

    expect(getLastConfig().headers).toMatchObject({
      Cookie: 'custom=value'
    });
  });

  test('should move headers.cookies to Cookie and remove cookies field', async () => {
    await request({
      url: '/cookie-rename',
      options: {
        headers: {
          cookies: 'foo=bar'
        }
      }
    });

    const headers = getLastConfig().headers as Record<string, string>;
    expect(headers.Cookie).toBe('foo=bar');
    expect(headers.cookies).toBeUndefined();
  });

  test('should set lowercase method in axios config', async () => {
    await request({
      url: '/method-test',
      method: 'POST'
    });

    expect(getLastConfig().method).toBe('post');
  });

  test('should keep provided data on POST request', async () => {
    const payload = { foo: 'bar' };

    await request({
      url: '/post-test',
      method: 'POST',
      options: {
        data: payload
      }
    });

    expect(getLastConfig().data).toEqual(payload);
  });

  test('should allow request interceptor to add default Content-Type for POST body', () => {
    const interceptor = getRequestInterceptor();

    const result = interceptor({
      method: 'post',
      data: { foo: 'bar' },
      headers: {}
    });

    expect(result.headers).toMatchObject({
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
  });

  test('should not overwrite existing Content-Type in request interceptor', () => {
    const interceptor = getRequestInterceptor();

    const result = interceptor({
      method: 'patch',
      data: { foo: 'bar' },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    expect(result.headers).toMatchObject({
      'Content-Type': 'application/json'
    });
  });
});
