import type { Mock } from 'vitest';
import getRecommendController from '../../../src/controllers/getRecommend';
import { getRecommend } from '../../../src/services';

vi.mock('../../../src/services');

describe('controllers/getRecommend', () => {
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

  test('should call getRecommend service without arguments', async () => {
    (getRecommend as Mock).mockResolvedValue({});

    await getRecommendController(mockCtx, mockNext);

    expect(getRecommend).toHaveBeenCalledWith();
  });

  test('should set response on successful API call', async () => {
    const mockResponse = { code: 0, data: { playlists: [] } };
    (getRecommend as Mock).mockResolvedValue(mockResponse);

    await getRecommendController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({
      response: mockResponse
    });
  });

  test('should handle API errors gracefully', async () => {
    (getRecommend as Mock).mockRejectedValueOnce(new Error('API error'));

    await getRecommendController(mockCtx, mockNext);

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(mockCtx.status).toBe(502);
    expect(mockCtx.body).toEqual({ error: '上游服务异常' });
  });

  test('should handle non-Error rejections with a generic upstream error', async () => {
    (getRecommend as Mock).mockRejectedValueOnce('Non-error rejection');

    await getRecommendController(mockCtx, mockNext);

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(mockCtx.status).toBe(502);
    expect(mockCtx.body).toEqual({ error: '上游服务异常' });
  });
});