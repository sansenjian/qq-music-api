import type { Mock } from 'vitest';
import getSingerAlbumController from '../../../src/controllers/getSingerAlbum';
import { getSingerAlbum } from '../../../src/services';

vi.mock('../../../src/services');

describe('controllers/getSingerAlbum', () => {
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

  test('should return 400 when singermid is missing', async () => {
    mockCtx.query = {};

    await getSingerAlbumController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(400);
    expect(mockCtx.body).toEqual({ response: 'no singermid' });
    expect(getSingerAlbum).not.toHaveBeenCalled();
  });

  test('should return 400 when singermid is empty string', async () => {
    mockCtx.query = { singermid: '' };

    await getSingerAlbumController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(400);
    expect(getSingerAlbum).not.toHaveBeenCalled();
  });

  test('should call getSingerAlbum with parsed singermid and defaults', async () => {
    mockCtx.query = { singermid: 'test123' };
    (getSingerAlbum as Mock).mockResolvedValue({});

    await getSingerAlbumController(mockCtx, mockNext);

    expect(getSingerAlbum).toHaveBeenCalledWith({
      singermid: 'test123',
      num: 5,
      begin: 0
    });
  });

  test('should accept custom limit and page', async () => {
    mockCtx.query = { singermid: 'test123', limit: '10', page: '3' };
    (getSingerAlbum as Mock).mockResolvedValue({});

    await getSingerAlbumController(mockCtx, mockNext);

    expect(getSingerAlbum).toHaveBeenCalledWith({
      singermid: 'test123',
      num: 10,
      begin: 3
    });
  });

  test('should set response on successful API call', async () => {
    mockCtx.query = { singermid: 'test123' };
    const mockResponse = { code: 0, data: { albums: [] } };
    (getSingerAlbum as Mock).mockResolvedValue(mockResponse);

    await getSingerAlbumController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({ response: mockResponse });
  });

  test('should handle API errors gracefully', async () => {
    mockCtx.query = { singermid: 'test123' };
    (getSingerAlbum as Mock).mockRejectedValue(new Error('API error'));

    await getSingerAlbumController(mockCtx, mockNext);

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(mockCtx.status).toBe(502);
    expect(mockCtx.body).toEqual({ error: '上游服务异常' });
  });
});