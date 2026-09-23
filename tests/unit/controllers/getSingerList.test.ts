import type { Mock } from 'vitest';
import getSingerListController from '../../../src/controllers/getSingerList';
import { getSingerList } from '../../../src/services';

vi.mock('../../../src/services');

describe('controllers/getSingerList', () => {
  let mockCtx: any;
  let mockNext: Mock;
  let consoleErrorSpy: any;

  beforeEach(() => {
    mockCtx = {
      status: 200,
      body: null,
      query: {}
    };
    mockNext = vi.fn();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('should call getSingerList with default parameters', async () => {
    (getSingerList as Mock).mockResolvedValue({});

    await getSingerListController(mockCtx, mockNext);

    expect(getSingerList).toHaveBeenCalledWith({
      area: -100,
      sex: -100,
      genre: -100,
      index: -100,
      page: 1
    });
  });

  test('should convert query parameters to numbers', async () => {
    mockCtx.query = { area: '1', sex: '0', genre: '5', index: '3', page: '2' };
    (getSingerList as Mock).mockResolvedValue({});

    await getSingerListController(mockCtx, mockNext);

    expect(getSingerList).toHaveBeenCalledWith({
      area: 1,
      sex: 0,
      genre: 5,
      index: 3,
      page: 2
    });
  });

  test('should set response on successful API call', async () => {
    const mockResponse = { code: 0, data: { singers: [] } };
    (getSingerList as Mock).mockResolvedValue(mockResponse);

    await getSingerListController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({
      response: mockResponse
    });
  });

  test('should handle API errors gracefully', async () => {
    (getSingerList as Mock).mockRejectedValue(new Error('API error'));

    await getSingerListController(mockCtx, mockNext);

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(mockCtx.status).toBe(502);
    expect(mockCtx.body).toEqual({ error: '上游服务异常' });
  });
});