import cookieMiddleware from '../../../util/cookie';
import type { UserInfo } from '../../../types/global';

describe('util/cookie middleware', () => {
  let mockCtx: any;
  let mockNext: jest.Mock;
  let originalUserInfo: UserInfo;

  beforeEach(() => {
    mockCtx = {
      cookies: {
        set: jest.fn()
      },
      request: {}
    };
    mockNext = jest.fn();
    originalUserInfo = global.userInfo;
    global.userInfo = {
      cookie: '',
      cookieList: [],
      cookieObject: {},
      loginUin: '',
      refreshData: () => {}
    };
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.userInfo = originalUserInfo;
  });

  test('should be a function that returns a middleware function', () => {
    const middleware = cookieMiddleware();
    expect(typeof middleware).toBe('function');
  });

  test('should set request.cookie when global.userInfo.cookie exists', async () => {
    global.userInfo = {
      cookie: 'test_cookie=value123',
      cookieList: [],
      cookieObject: {},
      loginUin: '123',
      refreshData: () => {}
    };

    const middleware = cookieMiddleware();
    await middleware(mockCtx, mockNext);

    expect(mockCtx.request.cookie).toBe('test_cookie=value123');
  });

  test('should not set request.cookie when global.userInfo.cookie is empty', async () => {
    global.userInfo = {
      cookie: '',
      cookieList: [],
      cookieObject: {},
      loginUin: '123',
      refreshData: () => {}
    };

    const middleware = cookieMiddleware();
    await middleware(mockCtx, mockNext);

    expect(mockCtx.request.cookie).toBeUndefined();
  });

  test('should set safe cookies from cookieList', async () => {
    global.userInfo = {
      cookie: '',
      cookieList: [
        'qqmusic_key=abc123',
        'qqmusic_uin=123456',
        'unsafe_cookie=bad'
      ],
      cookieObject: {},
      loginUin: '123',
      refreshData: () => {}
    };

    const middleware = cookieMiddleware();
    await middleware(mockCtx, mockNext);

    expect(mockCtx.cookies.set).toHaveBeenCalledWith('qqmusic_key', 'abc123', expect.any(Object));
    expect(mockCtx.cookies.set).toHaveBeenCalledWith('qqmusic_uin', '123456', expect.any(Object));
    expect(mockCtx.cookies.set).not.toHaveBeenCalledWith('unsafe_cookie', 'bad', expect.any(Object));
  });

  test('should handle empty cookieList', async () => {
    global.userInfo = {
      cookie: 'test=value',
      cookieList: [],
      cookieObject: {},
      loginUin: '123',
      refreshData: () => {}
    };

    const middleware = cookieMiddleware();
    await middleware(mockCtx, mockNext);

    expect(mockCtx.cookies.set).not.toHaveBeenCalled();
  });

  test('should parse cookie with = in value', async () => {
    global.userInfo = {
      cookie: '',
      cookieList: ['qqmusic_key=value=with=equals'],
      cookieObject: {},
      loginUin: '123',
      refreshData: () => {}
    };

    const middleware = cookieMiddleware();
    await middleware(mockCtx, mockNext);

    expect(mockCtx.cookies.set).toHaveBeenCalledWith('qqmusic_key', 'value=with=equals', expect.any(Object));
  });

  test('should skip cookies without valid key or value', async () => {
    global.userInfo = {
      cookie: '',
      cookieList: ['qqmusic_key=', '=nokey', 'qqmusic_uin=123'],
      cookieObject: {},
      loginUin: '123',
      refreshData: () => {}
    };

    const middleware = cookieMiddleware();
    await middleware(mockCtx, mockNext);

    expect(mockCtx.cookies.set).toHaveBeenCalledWith('qqmusic_uin', '123', expect.any(Object));
    expect(mockCtx.cookies.set).toHaveBeenCalledTimes(1);
  });

  test('should trim cookie keys and values', async () => {
    global.userInfo = {
      cookie: '',
      cookieList: ['  qqmusic_key  =  value123  '],
      cookieObject: {},
      loginUin: '123',
      refreshData: () => {}
    };

    const middleware = cookieMiddleware();
    await middleware(mockCtx, mockNext);

    expect(mockCtx.cookies.set).toHaveBeenCalledWith('qqmusic_key', 'value123', expect.any(Object));
  });

  test('should set cookies with correct options', async () => {
    global.userInfo = {
      cookie: '',
      cookieList: ['qqmusic_key=value'],
      cookieObject: {},
      loginUin: '123',
      refreshData: () => {}
    };

    const middleware = cookieMiddleware();
    await middleware(mockCtx, mockNext);

    expect(mockCtx.cookies.set).toHaveBeenCalledWith(
      'qqmusic_key',
      'value',
      expect.objectContaining({
        overwrite: true,
        httpOnly: false,
        sameSite: 'lax'
      })
    );
  });

  test('should call next() to continue middleware chain', async () => {
    const middleware = cookieMiddleware();
    await middleware(mockCtx, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  test('should call next() after setting cookies', async () => {
    global.userInfo = {
      cookie: 'test=value',
      cookieList: ['qqmusic_key=value'],
      cookieObject: {},
      loginUin: '123',
      refreshData: () => {}
    };

    const middleware = cookieMiddleware();
    await middleware(mockCtx, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });
});
