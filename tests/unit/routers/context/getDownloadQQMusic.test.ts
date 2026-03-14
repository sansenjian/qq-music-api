import getDownloadQQMusicController from '../../../../routers/context/getDownloadQQMusic';
import { downloadQQMusic } from '../../../../module';

jest.mock('../../../../module');

describe('routers/context/getDownloadQQMusic', () => {
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

  test('should call downloadQQMusic with default props', async () => {
    (downloadQQMusic as jest.Mock).mockResolvedValue({ status: 200, body: { code: 0, data: {} } });

    await getDownloadQQMusicController(mockCtx, mockNext);

    expect(downloadQQMusic).toHaveBeenCalledWith({
      method: 'get',
      params: {},
      option: {}
    });
  });

  test('should assign response to ctx', async () => {
    const mockResponse = {
      status: 200,
      body: { code: 0, data: { downloadUrl: 'http://example.com' } }
    };
    (downloadQQMusic as jest.Mock).mockResolvedValue(mockResponse);

    await getDownloadQQMusicController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({ code: 0, data: { downloadUrl: 'http://example.com' } });
  });

  test('should handle errors from downloadQQMusic', async () => {
    const mockError = new Error('Download error');
    (downloadQQMusic as jest.Mock).mockRejectedValue(mockError);

    await expect(getDownloadQQMusicController(mockCtx, mockNext)).rejects.toThrow('Download error');
  });
});
