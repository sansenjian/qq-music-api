import type { Mock } from 'vitest';
import getMvController from '../../../src/controllers/getMv';
import { getMv } from '../../../src/services';

vi.mock('../../../src/services');

describe('controllers/getMv', () => {
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

  test('should return 400 when version_id is empty', async () => {
    mockCtx.query = { version_id: '', area_id: '15' };

    await getMvController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(400);
    expect(mockCtx.body).toEqual({ response: 'version_id or area_id is null' });
    expect(getMv).not.toHaveBeenCalled();
  });

  test('should return 400 when area_id is empty', async () => {
    mockCtx.query = { version_id: '7', area_id: '' };

    await getMvController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(400);
    expect(mockCtx.body).toEqual({ response: 'version_id or area_id is null' });
    expect(getMv).not.toHaveBeenCalled();
  });

  test('should call getMv with default values when parameters are not provided', async () => {
    (getMv as Mock).mockResolvedValue({});

    await getMvController(mockCtx, mockNext);

    expect(getMv).toHaveBeenCalledWith({
      areaId: 15,
      versionId: 7,
      limit: 20,
      page: 0
    });
  });

  test('should accept custom parameters preserving original value types', async () => {
    mockCtx.query = { version_id: '10', area_id: '20', limit: '50', page: '3' };
    (getMv as Mock).mockResolvedValue({});

    await getMvController(mockCtx, mockNext);

    expect(getMv).toHaveBeenCalledWith({
      areaId: '20',
      versionId: '10',
      limit: 50,
      page: 3
    });
  });

  test('should set response on successful API call', async () => {
    mockCtx.query = { version_id: '7', area_id: '15' };
    const mockResponse = { code: 0, data: { mvList: [] } };
    (getMv as Mock).mockResolvedValue(mockResponse);

    await getMvController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({
      response: mockResponse
    });
  });

  test('should handle API errors gracefully', async () => {
    mockCtx.query = { version_id: '7', area_id: '15' };
    (getMv as Mock).mockRejectedValue(new Error('API error'));

    await getMvController(mockCtx, mockNext);

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(mockCtx.status).toBe(502);
    expect(mockCtx.body).toEqual({ error: '上游服务异常' });
  });
});