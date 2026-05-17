import { extractCookieValue, extractUinFromCookie } from '../../../util/cookieResolver';

describe('util/cookieResolver cookie value parsing', () => {
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
});
