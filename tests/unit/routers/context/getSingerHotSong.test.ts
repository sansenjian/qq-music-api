import getSingerHotSongController from '../../../../routers/context/getSingerHotsong';
import { UCommon } from '../../../../module';

jest.mock('../../../../module');

describe('routers/context/getSingerHotSong', () => {
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

  test('should return 400 when singermid is missing', async () => {
    mockCtx.query = {};

    await getSingerHotSongController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(400);
    expect(mockCtx.body).toEqual({ response: 'no singermid' });
    expect(UCommon).not.toHaveBeenCalled();
  });

  test('should return 400 when singermid is empty', async () => {
    mockCtx.query = { singermid: '' };

    await getSingerHotSongController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(400);
    expect(UCommon).not.toHaveBeenCalled();
  });

  test('should call UCommon with correct data structure', async () => {
    mockCtx.query = { singermid: 'test123' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getSingerHotSongController(mockCtx, mockNext);

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

    await getSingerHotSongController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    // page defaults to 0, so sin = (0 - 1) * 5 = -5
    expect(dataParam.singer.param).toMatchObject({
      singermid: 'test123',
      sin: -5,
      num: 5
    });
  });

  test('should calculate sin based on page and limit', async () => {
    mockCtx.query = { singermid: 'test123', limit: '10', page: '3' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getSingerHotSongController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    // sin = (page - 1) * num = (3 - 1) * 10 = 20
    expect(dataParam.singer.param.sin).toBe(20);
    expect(dataParam.singer.param.num).toBe(10);
  });

  test('should handle page 1 correctly', async () => {
    mockCtx.query = { singermid: 'test123', page: '1' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getSingerHotSongController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.singer.param.sin).toBe(0);
  });

  test('should set response on successful API call', async () => {
    mockCtx.query = { singermid: 'test123' };
    const mockResponse = { code: 0, data: { songs: [] } };
    (UCommon as jest.Mock).mockResolvedValue({ data: mockResponse });

    await getSingerHotSongController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({ response: mockResponse });
  });

  test('should handle API errors gracefully', async () => {
    mockCtx.query = { singermid: 'test123' };
    (UCommon as jest.Mock).mockRejectedValue(new Error('API error'));

    await getSingerHotSongController(mockCtx, mockNext);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Controller error:', expect.any(Error));
    expect(mockCtx.status).toBe(502);
    expect(mockCtx.body).toEqual({ error: 'API error' });
  });

  test('should construct correct data structure', async () => {
    mockCtx.query = { singermid: 'test123', limit: '10', page: '2' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getSingerHotSongController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam).toMatchObject({
      comm: {
        ct: 24,
        cv: 0
      },
      singer: {
        method: 'get_singer_detail_info',
        param: {
          sort: 5,
          singermid: 'test123',
          sin: 10,
          num: 10
        },
        module: 'music.web_singer_info_svr'
      }
    });
  });
});
