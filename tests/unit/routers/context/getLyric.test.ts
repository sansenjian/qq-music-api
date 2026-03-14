import getLyricController from '../../../../routers/context/getLyric';
import { getLyric } from '../../../../module';

jest.mock('../../../../module');

describe('routers/context/getLyric', () => {
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

  test('should return 400 when songmid is missing', async () => {
    mockCtx.query = {};

    await getLyricController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(400);
    expect(getLyric).not.toHaveBeenCalled();
  });

  test('should call getLyric with songmid param', async () => {
    mockCtx.query = { songmid: 'test123' };
    (getLyric as jest.Mock).mockResolvedValue({ status: 200, body: { code: 0, data: {} } });

    await getLyricController(mockCtx, mockNext);

    expect(getLyric).toHaveBeenCalledWith({
      method: 'get',
      params: { songmid: 'test123' },
      option: {}
    });
  });

  test('should assign response to ctx when songmid is provided', async () => {
    mockCtx.query = { songmid: 'test123' };
    const mockResponse = {
      status: 200,
      body: { code: 0, data: { lyric: 'test lyric' } }
    };
    (getLyric as jest.Mock).mockResolvedValue(mockResponse);

    await getLyricController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({ code: 0, data: { lyric: 'test lyric' } });
  });

  test('should handle errors from getLyric', async () => {
    mockCtx.query = { songmid: 'test123' };
    const mockError = new Error('Lyric error');
    (getLyric as jest.Mock).mockRejectedValue(mockError);

    await expect(getLyricController(mockCtx, mockNext)).rejects.toThrow('Lyric error');
  });
});
