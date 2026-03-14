import getDigitalAlbumListsController from '../../../../routers/context/getDigitalAlbumLists';
import { getDigitalAlbumLists } from '../../../../module';

jest.mock('../../../../module');

describe('routers/context/getDigitalAlbumLists', () => {
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

  test('should call getDigitalAlbumLists with default props', async () => {
    (getDigitalAlbumLists as jest.Mock).mockResolvedValue({ status: 200, body: { code: 0, data: {} } });

    await getDigitalAlbumListsController(mockCtx, mockNext);

    expect(getDigitalAlbumLists).toHaveBeenCalledWith({
      method: 'get',
      params: {},
      option: {}
    });
  });

  test('should assign response to ctx', async () => {
    const mockResponse = {
      status: 200,
      body: { code: 0, data: { albumLists: [] } }
    };
    (getDigitalAlbumLists as jest.Mock).mockResolvedValue(mockResponse);

    await getDigitalAlbumListsController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({ code: 0, data: { albumLists: [] } });
  });

  test('should handle errors from getDigitalAlbumLists', async () => {
    const mockError = new Error('Digital album lists error');
    (getDigitalAlbumLists as jest.Mock).mockRejectedValue(mockError);

    await expect(getDigitalAlbumListsController(mockCtx, mockNext)).rejects.toThrow('Digital album lists error');
  });
});
