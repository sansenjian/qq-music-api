import getSingerDescController from '../../../../routers/context/getSingerDesc';
import { getSingerDesc } from '../../../../module';

jest.mock('../../../../module');

describe('routers/context/getSingerDesc', () => {
  let mockCtx: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockCtx = {
      status: 200,
      body: null,
      query: {}
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  test('should return 400 when singermid is missing', async () => {
    mockCtx.query = {};

    await getSingerDescController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(400);
    expect(mockCtx.body).toEqual({
      status: 400,
      response: 'no singermid'
    });
    expect(getSingerDesc).not.toHaveBeenCalled();
  });

  test('should return 400 when singermid is empty string', async () => {
    mockCtx.query = { singermid: '' };

    await getSingerDescController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(400);
    expect(getSingerDesc).not.toHaveBeenCalled();
  });

  test('should call getSingerDesc with singermid param', async () => {
    mockCtx.query = { singermid: 'test123' };
    (getSingerDesc as jest.Mock).mockResolvedValue({ status: 200, body: { code: 0, data: {} } });

    await getSingerDescController(mockCtx, mockNext);

    expect(getSingerDesc).toHaveBeenCalledWith({
      method: 'get',
      params: {
        singermid: 'test123'
      },
      option: {}
    });
  });

  test('should assign response status and body to ctx', async () => {
    mockCtx.query = { singermid: 'test123' };
    const mockResponse = {
      status: 200,
      body: { code: 0, data: { singer: { name: 'Test Singer' } } }
    };
    (getSingerDesc as jest.Mock).mockResolvedValue(mockResponse);

    await getSingerDescController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({ code: 0, data: { singer: { name: 'Test Singer' } } });
  });

  test('should handle different status codes from API', async () => {
    mockCtx.query = { singermid: 'test123' };
    const mockResponse = {
      status: 404,
      body: { code: -1, message: 'Not found' }
    };
    (getSingerDesc as jest.Mock).mockResolvedValue(mockResponse);

    await getSingerDescController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(404);
    expect(mockCtx.body).toEqual({ code: -1, message: 'Not found' });
  });

  test('should handle errors from getSingerDesc', async () => {
    mockCtx.query = { singermid: 'test123' };
    const mockError = new Error('Singer desc error');
    (getSingerDesc as jest.Mock).mockRejectedValue(mockError);

    await expect(getSingerDescController(mockCtx, mockNext)).rejects.toThrow('Singer desc error');
  });
});
