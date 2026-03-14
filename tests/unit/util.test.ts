import { badRequest, customResponse, errorResponse, handleApi, successResponse } from '../../util/apiResponse';
import { getGtk, getGuid, hash33 } from '../../util/loginUtils';
import { Lyric, lyricParse } from '../../util/lyricParse';

describe('util/apiResponse', () => {
  it('successResponse 应返回默认 200 状态和 response body', () => {
    const result = successResponse({ ok: true });

    expect(result).toEqual({
      status: 200,
      body: {
        response: { ok: true },
      },
    });
  });

  it('errorResponse 应支持自定义状态码', () => {
    const error = new Error('boom');
    const result = errorResponse(error, 418);

    expect(result).toEqual({
      status: 418,
      body: {
        error,
      },
    });
  });

  it('customResponse 应原样返回自定义 body', () => {
    const body = { message: 'custom', extra: 1 };

    expect(customResponse(body, 202)).toEqual({
      status: 202,
      body,
    });
  });

  it('badRequest 应返回 400 和错误消息', () => {
    expect(badRequest('参数错误')).toEqual({
      status: 400,
      body: {
        response: '参数错误',
      },
    });
  });

  it('handleApi 应优先使用 result.data 并应用 transformData', async () => {
    const result = await handleApi(Promise.resolve({ data: { count: 2 } } as any), {
      transformData: (data: { count: number }) => ({ doubled: data.count * 2 }),
      customStatus: 201,
    });

    expect(result).toEqual({
      status: 201,
      body: {
        response: { doubled: 4 },
      },
    });
  });

  it('handleApi 应在没有 data 字段时直接返回结果', async () => {
    const payload = { list: [1, 2, 3] };

    await expect(handleApi(Promise.resolve(payload))).resolves.toEqual({
      status: 200,
      body: {
        response: payload,
      },
    });
  });

  it('handleApi 应在测试环境下捕获错误且不打印日志', async () => {
    const error = new Error('test failure');
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';

    try {
      await expect(handleApi(Promise.reject(error))).resolves.toEqual({
        status: 500,
        body: {
          error,
        },
      });

      expect(consoleSpy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = previousEnv;
      consoleSpy.mockRestore();
    }
  });

  it('handleApi 应在非测试环境下按默认行为打印日志', async () => {
    const error = new Error('prod failure');
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    try {
      await handleApi(Promise.reject(error));
      expect(consoleSpy).toHaveBeenCalledWith('API error:', error);
    } finally {
      process.env.NODE_ENV = previousEnv;
      consoleSpy.mockRestore();
    }
  });

  it('handleApi 在 logError=false 时应跳过日志输出', async () => {
    const error = new Error('silent failure');
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    try {
      await handleApi(Promise.reject(error), { logError: false, customStatus: 503 });
      expect(consoleSpy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = previousEnv;
      consoleSpy.mockRestore();
    }
  });
});

describe('util/loginUtils', () => {
  it('hash33 应返回稳定哈希值', () => {
    expect(hash33('qqmusic')).toBe(167923363);
    expect(hash33('')).toBe(0);
  });

  it('getGtk 应返回稳定 gtk 值', () => {
    expect(getGtk('p_skey_value')).toBe(1068330540);
    expect(getGtk('')).toBe(5381);
  });

  it('getGuid 应生成符合 UUID v4 形状的大写字符串', () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);

    try {
      const guid = getGuid();
      expect(guid).toBe('88888888-8888-4888-8888-888888888888');
      expect(guid).toMatch(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/);
    } finally {
      randomSpy.mockRestore();
    }
  });
});

describe('util/lyricParse', () => {
  it('Lyric 应解析标签、排序时间并展开多时间戳', () => {
    const lyric = new Lyric(
      ['[ti:Song Title]', '[ar:Artist]', '[00:03.50]第三句', '[00:01.00][00:02.00]重复句'].join('\n')
    );

    expect(lyric.tags).toEqual({
      title: 'Song Title',
      artist: 'Artist',
      album: '',
      offset: '',
      by: '',
    });

    expect(lyric.lines).toEqual([
      { time: 1000, txt: '重复句' },
      { time: 2000, txt: '重复句' },
      { time: 3500, txt: '第三句' },
    ]);
  });

  it('Lyric 应忽略没有文本内容的时间标签行', () => {
    const lyric = new Lyric('[00:01.00]\n[00:02.00]   \n[00:03.00]保留');

    expect(lyric.lines).toEqual([{ time: 3000, txt: '保留' }]);
  });

  it('Lyric 应按当前实现处理 3 位毫秒字段', () => {
    const lyric = new Lyric('[00:01.123]毫秒测试');

    expect(lyric.lines).toEqual([{ time: 2230, txt: '毫秒测试' }]);
  });

  it('lyricParse 应返回 Lyric 实例', () => {
    const parsed = lyricParse('[00:10.00]hello');

    expect(parsed).toBeInstanceOf(Lyric);
    expect(parsed.lines).toEqual([{ time: 10000, txt: 'hello' }]);
  });
});
