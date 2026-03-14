import getAlbumInfo from '../../../../../module/apis/album/getAlbumInfo';
import y_common from '../../../../../module/apis/y_common';
import { handleApi } from '../../../../../util/apiResponse';

jest.mock('../../../../../module/apis/y_common');
jest.mock('../../../../../util/apiResponse');

describe('module/apis/album/getAlbumInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (handleApi as jest.Mock).mockImplementation((promise) => promise);
  });

  test('should be a function', () => {
    expect(typeof getAlbumInfo).toBe('function');
  });

  test('should call y_common with correct URL', async () => {
    (y_common as jest.Mock).mockResolvedValue({ data: { code: 0, data: {} } });

    await getAlbumInfo({ method: 'get', params: {}, option: {} });

    expect(y_common).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/v8/fcg-bin/fcg_v8_album_info_cp.fcg'
      })
    );
  });

  test('should use default method get when not provided', async () => {
    (y_common as jest.Mock).mockResolvedValue({ data: { code: 0, data: {} } });

    await getAlbumInfo({ params: {}, option: {} });

    expect(y_common).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'get'
      })
    );
  });

  test('should pass albummid param to y_common', async () => {
    (y_common as jest.Mock).mockResolvedValue({ data: { code: 0, data: {} } });

    await getAlbumInfo({
      method: 'get',
      params: { albummid: 'test123' },
      option: {}
    });

    expect(y_common).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          params: expect.objectContaining({
            albummid: 'test123'
          })
        })
      })
    );
  });

  test('should add format and outCharset to params', async () => {
    (y_common as jest.Mock).mockResolvedValue({ data: { code: 0, data: {} } });

    await getAlbumInfo({
      method: 'get',
      params: { albummid: 'test123' },
      option: {}
    });

    const callArgs = (y_common as jest.Mock).mock.calls[0][0];
    expect(callArgs.options.params).toMatchObject({
      albummid: 'test123',
      format: 'json',
      outCharset: 'utf-8'
    });
  });

  test('should merge custom options', async () => {
    (y_common as jest.Mock).mockResolvedValue({ data: { code: 0, data: {} } });
    const customOption = { timeout: 5000 };

    await getAlbumInfo({
      method: 'get',
      params: {},
      option: customOption
    });

    const callArgs = (y_common as jest.Mock).mock.calls[0][0];
    expect(callArgs.options).toMatchObject({
      timeout: 5000,
      params: expect.any(Object)
    });
  });

  test('should call handleApi with y_common promise', async () => {
    const mockResponse = { data: { code: 0, data: { album: {} } } };
    (y_common as jest.Mock).mockResolvedValue(mockResponse);
    (handleApi as jest.Mock).mockResolvedValue({ status: 200, body: mockResponse });

    const result = await getAlbumInfo({ method: 'get', params: {}, option: {} });

    expect(handleApi).toHaveBeenCalledWith(expect.any(Promise));
    expect(result).toEqual({ status: 200, body: mockResponse });
  });

  test('should handle empty params', async () => {
    (y_common as jest.Mock).mockResolvedValue({ data: { code: 0, data: {} } });

    await getAlbumInfo({ method: 'get', params: {}, option: {} });

    const callArgs = (y_common as jest.Mock).mock.calls[0][0];
    expect(callArgs.options.params).toMatchObject({
      format: 'json',
      outCharset: 'utf-8'
    });
  });
});
