import getTopListsController from '../../../../routers/context/getTopLists';
import { getTopLists } from '../../../../module';

jest.mock('../../../../module');

describe('routers/context/getTopLists', () => {
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

  test('should call getTopLists with default props', async () => {
    (getTopLists as jest.Mock).mockResolvedValue({ status: 200, body: { code: 0, data: {} } });

    await getTopListsController(mockCtx, mockNext);

    expect(getTopLists).toHaveBeenCalledWith({
      method: 'get',
      params: {},
      option: {}
    });
  });

  test('should assign response to ctx', async () => {
    const mockResponse = {
      status: 200,
      body: { code: 0, data: { topLists: [] } }
    };
    (getTopLists as jest.Mock).mockResolvedValue(mockResponse);

    await getTopListsController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({ code: 0, data: { topLists: [] } });
  });

  test('should handle query parameters', async () => {
    mockCtx.query = { format: 'json' };
    (getTopLists as jest.Mock).mockResolvedValue({ status: 200, body: { code: 0, data: {} } });

    await getTopListsController(mockCtx, mockNext);

    expect(getTopLists).toHaveBeenCalledWith({
      method: 'get',
      params: {},
      option: {}
    });
  });

  test('should handle errors from getTopLists', async () => {
    const mockError = new Error('Top lists error');
    (getTopLists as jest.Mock).mockRejectedValue(mockError);

    await expect(getTopListsController(mockCtx, mockNext)).rejects.toThrow('Top lists error');
  });
});
