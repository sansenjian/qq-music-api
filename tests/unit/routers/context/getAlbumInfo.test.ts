import getAlbumInfoController from '../../../../routers/context/getAlbumInfo';
import { getAlbumInfo } from '../../../../module';

jest.mock('../../../../module');

describe('routers/context/getAlbumInfo', () => {
  let mockCtx: any;
  let mockNext: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockCtx = {
      status: 200,
      body: null,
      query: {}
    };
    mockNext = jest.fn();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('should return 400 when albummid is missing', async () => {
    mockCtx.query = {};

    await getAlbumInfoController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(400);
    expect(mockCtx.body).toEqual({
      error: 'no albummid'
    });
    expect(getAlbumInfo).not.toHaveBeenCalled();
  });

  test('should call getAlbumInfo with albummid param', async () => {
    mockCtx.query = { albummid: 'test123' };
    (getAlbumInfo as jest.Mock).mockResolvedValue({ status: 200, body: { code: 0, data: {} } });

    await getAlbumInfoController(mockCtx, mockNext);

    expect(getAlbumInfo).toHaveBeenCalledWith({
      method: 'get',
      params: { albummid: 'test123' },
      option: {}
    });
  });

  test('should assign response to ctx when albummid is provided', async () => {
    mockCtx.query = { albummid: 'test123' };
    const mockResponse = {
      status: 200,
      body: { code: 0, data: { album: { name: 'Test Album' } } }
    };
    (getAlbumInfo as jest.Mock).mockResolvedValue(mockResponse);

    await getAlbumInfoController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({ code: 0, data: { album: { name: 'Test Album' } } });
  });

  test('should handle empty string albummid', async () => {
    mockCtx.query = { albummid: '' };

    await getAlbumInfoController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(400);
    expect(getAlbumInfo).not.toHaveBeenCalled();
  });

  test('should handle errors from getAlbumInfo', async () => {
    mockCtx.query = { albummid: 'test123' };
    const mockError = new Error('Album info error');
    (getAlbumInfo as jest.Mock).mockRejectedValue(mockError);

    await getAlbumInfoController(mockCtx, mockNext);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Controller error:', expect.any(Error));
    expect(mockCtx.status).toBe(502);
    expect(mockCtx.body).toEqual({ error: 'Album info error' });
  });
});
