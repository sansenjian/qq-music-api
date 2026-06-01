import type { UserInfo } from '../../../src/types';
import {
  extractCookieValue,
  extractUinFromCookie,
  resolveRequestCookie,
} from '../../../src/util/cookieResolver';

const createContext = (overrides: Record<string, unknown> = {}) => ({
  query: {},
  headers: {},
  request: {},
  ...overrides,
}) as any;

describe('util/cookieResolver cookie value parsing', () => {
  let originalUserInfo: UserInfo;

  beforeEach(() => {
    originalUserInfo = global.userInfo;
    global.userInfo = {
      loginUin: '123456',
      uin: 'o123456',
      cookie: 'global_cookie=1',
      cookieList: ['global_cookie=1'],
      cookieObject: {
        global_cookie: '1',
      },
      refreshData: () => ({}),
    };
  });

  afterEach(() => {
    global.userInfo = originalUserInfo;
  });

  test('should extract a named cookie value', () => {
    expect(extractCookieValue('uin=o123456; qqmusic_key=mock-key', 'qqmusic_key')).toBe('mock-key');
  });

  test('should support names with regexp metacharacters', () => {
    expect(extractCookieValue('foo.bar=value; other=1', 'foo.bar')).toBe('value');
  });

  test('should trim values and ignore empty matches', () => {
    expect(extractCookieValue('qqmusic_key=  value  ', 'qqmusic_key')).toBe('value');
    expect(extractCookieValue('qqmusic_key=; uin=o123456', 'qqmusic_key')).toBeUndefined();
  });

  test('should reuse cookie value parsing for uin extraction', () => {
    expect(extractUinFromCookie('qqmusic_key=mock-key; uin=o123456')).toBe('o123456');
  });

  test('should prefer query cookie over headers, request, and global cookie', () => {
    const result = resolveRequestCookie(
      createContext({
        query: { cookie: 'query_cookie=1' },
        headers: {
          'x-custom-cookie': 'custom_cookie=1',
          cookie: 'header_cookie=1',
        },
        request: {
          cookie: 'request_cookie=1',
        },
      }),
      { fallbackMode: true, useGlobalCookie: true },
    );

    expect(result).toEqual({ cookie: 'query_cookie=1', source: 'query' });
  });

  test('should prefer x-custom-cookie over Cookie header when query cookie is missing', () => {
    const result = resolveRequestCookie(
      createContext({
        headers: {
          'x-custom-cookie': 'custom_cookie=1',
          cookie: 'header_cookie=1',
        },
      }),
      { fallbackMode: true, useGlobalCookie: true },
    );

    expect(result).toEqual({ cookie: 'custom_cookie=1', source: 'x-custom-cookie' });
  });

  test('should ignore query and header cookies when fallback mode is disabled', () => {
    const result = resolveRequestCookie(
      createContext({
        query: { cookie: 'query_cookie=1' },
        headers: { cookie: 'header_cookie=1' },
        request: { cookie: 'request_cookie=1' },
      }),
      { fallbackMode: false, useGlobalCookie: true },
    );

    expect(result).toEqual({ cookie: 'request_cookie=1', source: 'request' });
  });

  test('should use global cookie only when explicitly enabled', () => {
    expect(resolveRequestCookie(createContext(), { fallbackMode: false, useGlobalCookie: false })).toEqual({
      source: 'none',
    });
    expect(resolveRequestCookie(createContext(), { fallbackMode: false, useGlobalCookie: true })).toEqual({
      cookie: 'global_cookie=1',
      source: 'global',
    });
  });
});
