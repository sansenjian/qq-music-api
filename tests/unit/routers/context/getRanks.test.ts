import getRanksController from '../../../../routers/context/getRanks';
import { UCommon } from '../../../../module';

jest.mock('../../../../module');

describe('routers/context/getRanks', () => {
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

    await getRanksController(mockCtx, mockNext);

    expect(UCommon).toHaveBeenCalledWith({
      method: 'get',
      params: {
        format: 'json',
        data: expect.any(String)
      },
      option: {}
    });
  });

  test('should use default topId value of 4', async () => {
    mockCtx.query = {};
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getRanksController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.req_1.param.topId).toBe(4);
  });

  test('should accept custom topId parameter', async () => {
    mockCtx.query = { topId: '10' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getRanksController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.req_1.param.topId).toBe(10);
  });

  test('should use default limit value of 20', async () => {
    mockCtx.query = {};
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getRanksController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.req_1.param.num).toBe(20);
  });

  test('should accept custom limit parameter', async () => {
    mockCtx.query = { limit: '50' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getRanksController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.req_1.param.num).toBe(50);
  });

  test('should use default page value of 0', async () => {
    mockCtx.query = {};
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getRanksController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.req_1.param.offset).toBe(0);
  });

  test('should accept custom page parameter', async () => {
    mockCtx.query = { page: '5' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getRanksController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.req_1.param.offset).toBe(5);
  });

  test('should calculate week number correctly', async () => {
    const fixedDate = new Date('2023-01-05T12:00:00Z'); // fixed, deterministic date
    jest.useFakeTimers().setSystemTime(fixedDate);

    try {
      mockCtx.query = {};
      (UCommon as jest.Mock).mockResolvedValue({ data: {} });

      await getRanksController(mockCtx, mockNext);

      const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
      const dataParam = JSON.parse(callArgs.params.data);

      const expectedWeek = getWeekNumber(fixedDate);
      const expectedPeriod = `${fixedDate.getFullYear()}_${expectedWeek}`;

      expect(dataParam.req_1.param.period).toBe(expectedPeriod);
    } finally {
      jest.useRealTimers();
    }
  });

  test('should set response on successful API call', async () => {
    const mockResponse = { code: 0, data: { topList: [] } };
    (UCommon as jest.Mock).mockResolvedValue({ data: mockResponse });

    await getRanksController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({
      response: mockResponse
    });
  });

  test('should handle API errors gracefully', async () => {
    (UCommon as jest.Mock).mockRejectedValue(new Error('API error'));

    await getRanksController(mockCtx, mockNext);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Controller error:', expect.any(Error));
    expect(mockCtx.status).toBe(502);
    expect(mockCtx.body).toEqual({ error: 'API error' });
  });

  test('should have correct comm structure', async () => {
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getRanksController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.comm).toMatchObject({
      ct: 24,
      cv: 4747474,
      format: 'json',
      inCharset: 'utf-8',
      needNewCode: 1,
      uin: 0
    });
  });

  test('should have correct req_1 module config', async () => {
    mockCtx.query = { topId: '10', limit: '30', page: '2' };
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getRanksController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.req_1).toMatchObject({
      module: 'musicToplist.ToplistInfoServer',
      method: 'GetDetail',
      param: {
        topId: 10,
        offset: 2,
        num: 30,
        period: expect.any(String)
      }
    });
  });
});

function getWeekNumber(d: Date): number {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
