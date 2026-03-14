import getSingerListController from '../../../../routers/context/getSingerList';
import { UCommon } from '../../../../module';

jest.mock('../../../../module');

describe('routers/context/getSingerList', () => {
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

  test('should call UCommon with default parameters', async () => {
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getSingerListController(mockCtx, mockNext);

    expect(UCommon).toHaveBeenCalledWith({
      method: 'get',
      params: {
        format: 'json',
        data: expect.any(String)
      },
      option: {}
    });
  });

  test('should use default values for all query parameters', async () => {
    mockCtx.query = {};
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getSingerListController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.singerList.param).toMatchObject({
      area: -100,
      sex: -100,
      genre: -100,
      index: -100,
      sin: 0,
      cur_page: 1
    });
  });

  test('should accept custom area parameter', async () => {
    mockCtx.query = { area: '1' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getSingerListController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.singerList.param.area).toBe(1);
  });

  test('should accept custom sex parameter', async () => {
    mockCtx.query = { sex: '0' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getSingerListController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.singerList.param.sex).toBe(0);
  });

  test('should accept custom genre parameter', async () => {
    mockCtx.query = { genre: '5' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getSingerListController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.singerList.param.genre).toBe(5);
  });

  test('should accept custom index parameter', async () => {
    mockCtx.query = { index: '3' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getSingerListController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.singerList.param.index).toBe(3);
  });

  test('should accept custom page parameter', async () => {
    mockCtx.query = { page: '3' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getSingerListController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.singerList.param.sin).toBe(160);
    expect(dataParam.singerList.param.cur_page).toBe(3);
  });

  test('should calculate sin correctly based on page', async () => {
    mockCtx.query = { page: '5' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getSingerListController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    // sin = (pageNum - 1) * 80 = (5 - 1) * 80 = 320
    expect(dataParam.singerList.param.sin).toBe(320);
  });

  test('should set response on successful API call', async () => {
    const mockResponse = { code: 0, data: { singers: [] } };
    (UCommon as jest.Mock).mockResolvedValue({ data: mockResponse });

    await getSingerListController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({
      status: 200,
      response: mockResponse
    });
  });

  test('should handle API errors gracefully', async () => {
    (UCommon as jest.Mock).mockRejectedValue(new Error('API error'));

    await getSingerListController(mockCtx, mockNext);

    expect(consoleErrorSpy).toHaveBeenCalledWith('getSingerList error:', expect.any(Error));
    expect(mockCtx.status).toBe(500);
    expect(mockCtx.body).toEqual({ error: '服务器内部错误' });
  });

  test('should construct correct data structure', async () => {
    mockCtx.query = { area: '1', sex: '0', genre: '5', index: '3', page: '2' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getSingerListController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam).toMatchObject({
      comm: {
        ct: 24,
        cv: 0
      },
      singerList: {
        module: 'Music.SingerListServer',
        method: 'get_singer_list',
        param: {
          area: 1,
          sex: 0,
          genre: 5,
          index: 3,
          sin: 80,
          cur_page: 2
        }
      }
    });
  });

  test('should handle string to number conversion for all params', async () => {
    mockCtx.query = {
      area: '100',
      sex: '-1',
      genre: '50',
      index: '-50',
      page: '10'
    };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getSingerListController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.singerList.param).toMatchObject({
      area: 100,
      sex: -1,
      genre: 50,
      index: -50,
      sin: 720,
      cur_page: 10
    });
  });
});
