import type { Mock } from 'vitest';
import getRanksController from '../../../src/controllers/getRanks';
import { getRanks } from '../../../src/services';

vi.mock('../../../src/services');

describe('controllers/getRanks', () => {
  let mockCtx: any;
  let mockNext: Mock;
  let consoleErrorSpy: any;

  beforeEach(() => {
    mockCtx = {
      status: 200,
      body: null,
      query: {},
    };
    mockNext = vi.fn();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('should call getRanks with default parameters', async () => {
    (getRanks as Mock).mockResolvedValue({});

    await getRanksController(mockCtx, mockNext);

    expect(getRanks).toHaveBeenCalledWith({
      topId: 4,
      num: 20,
      offset: 0,
      resolveMid: false,
    });
  });

  test('should accept custom topId, limit, and page', async () => {
    mockCtx.query = { topId: '10', limit: '50', page: '5' };
    (getRanks as Mock).mockResolvedValue({});

    await getRanksController(mockCtx, mockNext);

    expect(getRanks).toHaveBeenCalledWith({
      topId: 10,
      num: 50,
      offset: 5,
      resolveMid: false,
    });
  });

  test('should pass resolveMid=true when query flag is set', async () => {
    mockCtx.query = { resolveMid: 'true' };
    (getRanks as Mock).mockResolvedValue({});

    await getRanksController(mockCtx, mockNext);

    expect(getRanks).toHaveBeenCalledWith(
      expect.objectContaining({ resolveMid: true }),
    );
  });

  test('should set response on successful API call', async () => {
    const mockResponse = { code: 0, data: { topList: [] } };
    (getRanks as Mock).mockResolvedValue(mockResponse);

    await getRanksController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({
      response: mockResponse,
    });
  });

  test('should handle API errors gracefully', async () => {
    (getRanks as Mock).mockRejectedValue(new Error('API error'));

    await getRanksController(mockCtx, mockNext);

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(mockCtx.status).toBe(502);
    expect(mockCtx.body).toEqual({ error: '上游服务异常' });
  });
});