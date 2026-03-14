import getSingerAlbumController from '../../../../routers/context/getSingerAlbum';
import { UCommon } from '../../../../module';

jest.mock('../../../../module');

describe('routers/context/getSingerAlbum', () => {
  let mockCtx: any;
  let mockNext: jest.Mock;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    mockCtx = {
      status: 200,
      body: null,
      query: {}
    };
    mockNext = jest.fn();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  test('should return 400 when singermid is missing', async () => {
    mockCtx.query = {};

    await getSingerAlbumController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(400);
    expect(mockCtx.body).toEqual({ response: 'no singermid' });
    expect(UCommon).not.toHaveBeenCalled();
  });

  test('should return 400 when singermid is empty string', async () => {
    mockCtx.query = { singermid: '' };

    await getSingerAlbumController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(400);
    expect(UCommon).not.toHaveBeenCalled();
  });

  test('should call UCommon with correct data structure when singermid is provided', async () => {
    mockCtx.query = { singermid: 'test123' };
    (UCommon as jest.Mock).mockResolvedValue({ data: { code: 0, data: {} } });

    await getSingerAlbumController(mockCtx, mockNext);

    expect(UCommon).toHaveBeenCalledWith({
      method: 'get',
      params: {
        format: 'json',
        singermid: 'test123',
        data: expect.any(String)
      },
      option: {}
    });
  });

  test('should use default limit and page values', async () => {
    mockCtx.query = { singermid: 'test123' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getSingerAlbumController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.singer.param).toMatchObject({
      singermid: 'test123',
      begin: 0,
      num: 5
    });
  });

  test('should accept custom limit parameter', async () => {
    mockCtx.query = { singermid: 'test123', limit: '10' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getSingerAlbumController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.singer.param.num).toBe(10);
  });

  test('should accept custom page parameter', async () => {
    mockCtx.query = { singermid: 'test123', page: '3' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getSingerAlbumController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.singer.param.begin).toBe(3);
  });

  test('should set response on successful API call', async () => {
    mockCtx.query = { singermid: 'test123' };
    const mockResponse = { code: 0, data: { albums: [] } };
    (UCommon as jest.Mock).mockResolvedValue({ data: mockResponse });

    await getSingerAlbumController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({ response: mockResponse });
  });

  test('should handle API errors gracefully', async () => {
    mockCtx.query = { singermid: 'test123' };
    (UCommon as jest.Mock).mockRejectedValue(new Error('API error'));

    await getSingerAlbumController(mockCtx, mockNext);

    expect(consoleLogSpy).toHaveBeenCalledWith('error', expect.any(Error));
    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toBeNull();
  });

  test('should construct correct data structure for UCommon', async () => {
    mockCtx.query = { singermid: 'test123', limit: '10', page: '2' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getSingerAlbumController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam).toMatchObject({
      comm: {
        ct: 24,
        cv: 0
      },
      singer: {
        method: 'GetAlbumList',
        param: {
          sort: 5,
          singermid: 'test123',
          begin: 2,
          num: 10
        },
        module: 'music.musichallAlbum.AlbumListServer'
      }
    });
  });
});
