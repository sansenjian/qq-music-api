import getMvController from '../../../../routers/context/getMv';
import { UCommon } from '../../../../module';

jest.mock('../../../../module');

describe('routers/context/getMv', () => {
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

  test('should call UCommon when both version_id and area_id are provided', async () => {
    mockCtx.query = { version_id: '7', area_id: '15' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getMvController(mockCtx, mockNext);

    expect(UCommon).toHaveBeenCalledWith({
      method: 'get',
      params: {
        format: 'json',
        data: expect.any(String)
      },
      option: {}
    });
  });

  test('should use default values when parameters are not provided', async () => {
    mockCtx.query = {};
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getMvController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.mv_list.param).toMatchObject({
      version_id: 7,
      area_id: 15
    });
  });

  test('should use default limit and page values', async () => {
    mockCtx.query = { version_id: '7', area_id: '15' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getMvController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.mv_list.param).toMatchObject({
      start: 0,
      limit: 20,
      version_id: '7',
      area_id: '15',
      order: 1
    });
  });

  test('should accept custom limit parameter', async () => {
    mockCtx.query = { version_id: '7', area_id: '15', limit: '50' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getMvController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.mv_list.param.limit).toBe(50);
  });

  test('should accept custom page parameter', async () => {
    mockCtx.query = { version_id: '7', area_id: '15', page: '3' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getMvController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    // start = (page - 1) * limit = (3 - 1) * 20 = 40
    expect(dataParam.mv_list.param.start).toBe(40);
  });

  test('should calculate start correctly based on page and limit', async () => {
    mockCtx.query = { version_id: '7', area_id: '15', page: '5', limit: '10' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getMvController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    // start = (5 - 1) * 10 = 40
    expect(dataParam.mv_list.param.start).toBe(40);
    expect(dataParam.mv_list.param.limit).toBe(10);
  });

  test('should accept custom area_id parameter', async () => {
    mockCtx.query = { version_id: '7', area_id: '20' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getMvController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.mv_list.param.area_id).toBe('20');
  });

  test('should accept custom version_id parameter', async () => {
    mockCtx.query = { version_id: '10', area_id: '15' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getMvController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.mv_list.param.version_id).toBe('10');
  });

  test('should set response on successful API call', async () => {
    mockCtx.query = { version_id: '7', area_id: '15' };
    const mockResponse = { code: 0, data: { mvList: [] } };
    (UCommon as jest.Mock).mockResolvedValue({ data: mockResponse });

    await getMvController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({
      response: mockResponse
    });
  });

  test('should handle API errors gracefully', async () => {
    mockCtx.query = { version_id: '7', area_id: '15' };
    (UCommon as jest.Mock).mockRejectedValue(new Error('API error'));

    await getMvController(mockCtx, mockNext);

    expect(consoleLogSpy).toHaveBeenCalledWith('error', expect.any(Error));
    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toBeNull();
  });

  test('should have correct data structure', async () => {
    mockCtx.query = { version_id: '7', area_id: '15' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getMvController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam).toMatchObject({
      comm: {
        ct: 24
      },
      mv_tag: {
        module: 'MvService.MvInfoProServer',
        method: 'GetAllocTag',
        param: {}
      },
      mv_list: {
        module: 'MvService.MvInfoProServer',
        method: 'GetAllocMvInfo',
        param: {
          start: 0,
          limit: 20,
          version_id: '7',
          area_id: '15',
          order: 1
        }
      }
    });
  });
});
