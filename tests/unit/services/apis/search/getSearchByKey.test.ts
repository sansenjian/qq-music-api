import type { Mock } from 'vitest';
import getSearchByKey from '../../../../../src/services/apis/search/getSearchByKey';
import y_common from '../../../../../src/services/apis/y_common';
import { handleApi } from '../../../../../src/util/apiResponse';

vi.mock('../../../../../src/services/apis/y_common');
vi.mock('../../../../../src/util/apiResponse');

describe('services/apis/search/getSearchByKey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (handleApi as Mock).mockImplementation((promise) => promise);
  });

  test('should be a function', () => {
    expect(typeof getSearchByKey).toBe('function');
  });

  test('should call y_common with correct URL', async () => {
    (y_common as Mock).mockResolvedValue({ data: { code: 0, data: {} } });

    await getSearchByKey({ method: 'get', params: {}, option: {} });

    expect(y_common).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/soso/fcgi-bin/client_search_cp'
      })
    );
  });

  test('should use default method get when not provided', async () => {
    (y_common as Mock).mockResolvedValue({ data: { code: 0, data: {} } });

    await getSearchByKey({ params: {}, option: {} });

    expect(y_common).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'get'
      })
    );
  });

  test('should normalize key param to upstream w param', async () => {
    (y_common as Mock).mockResolvedValue({ data: { code: 0, data: {} } });

    await getSearchByKey({
      method: 'get',
      params: { key: 'test music' },
      option: {}
    });

    expect(y_common).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          params: expect.objectContaining({
            w: 'test music'
          })
        })
      })
    );
    const callArgs = (y_common as Mock).mock.calls[0][0];
    expect(callArgs.options.params).not.toHaveProperty('key');
  });

  test('should add default params', async () => {
    (y_common as Mock).mockResolvedValue({ data: { code: 0, data: {} } });

    await getSearchByKey({
      method: 'get',
      params: { key: 'test' },
      option: {}
    });

    const callArgs = (y_common as Mock).mock.calls[0][0];
    expect(callArgs.options.params).toMatchObject({
      w: 'test',
      format: 'json',
      outCharset: 'utf-8',
      ct: 24,
      qqmusic_ver: 1298,
      remoteplace: 'txt.yqq.song',
      t: 0,
      aggr: 1,
      cr: 1,
      lossless: 0,
      flag_qc: 0,
      platform: 'yqq.json'
    });
  });

  test('should allow overriding n and p params', async () => {
    (y_common as Mock).mockResolvedValue({ data: { code: 0, data: {} } });

    await getSearchByKey({
      method: 'get',
      params: { key: 'test', n: 50, p: 3 },
      option: {}
    });

    const callArgs = (y_common as Mock).mock.calls[0][0];
    expect(callArgs.options.params).toMatchObject({
      w: 'test',
      n: 50,
      p: 3
    });
  });

  test('should preserve explicit w param over key alias', async () => {
    (y_common as Mock).mockResolvedValue({ data: { code: 0, data: {} } });

    await getSearchByKey({
      method: 'get',
      params: { key: 'ignored', w: 'actual', remoteplace: 'txt.yqq.album' },
      option: {}
    });

    const callArgs = (y_common as Mock).mock.calls[0][0];
    expect(callArgs.options.params).toMatchObject({
      w: 'actual',
      remoteplace: 'txt.yqq.album'
    });
    expect(callArgs.options.params).not.toHaveProperty('key');
  });

  test('should merge custom options', async () => {
    (y_common as Mock).mockResolvedValue({ data: { code: 0, data: {} } });
    const customOption = { timeout: 10000 };

    await getSearchByKey({
      method: 'get',
      params: { key: 'test' },
      option: customOption
    });

    const callArgs = (y_common as Mock).mock.calls[0][0];
    expect(callArgs.options).toMatchObject({
      timeout: 10000,
      params: expect.any(Object)
    });
  });

  test('should call handleApi with y_common promise', async () => {
    const mockResponse = { data: { code: 0, data: { song: {} } } };
    (y_common as Mock).mockResolvedValue(mockResponse);
    (handleApi as Mock).mockResolvedValue({ status: 200, body: mockResponse });

    const result = await getSearchByKey({ method: 'get', params: { key: 'test' }, option: {} });

    expect(handleApi).toHaveBeenCalledWith(expect.any(Promise));
    expect(result).toEqual({ status: 200, body: mockResponse });
  });

  test('should handle empty key', async () => {
    (y_common as Mock).mockResolvedValue({ data: { code: 0, data: {} } });

    await getSearchByKey({ method: 'get', params: { key: '' }, option: {} });

    const callArgs = (y_common as Mock).mock.calls[0][0];
    expect(callArgs.options.params.w).toBe('');
    expect(callArgs.options.params).not.toHaveProperty('key');
  });
});
