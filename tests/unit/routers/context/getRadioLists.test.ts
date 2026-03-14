import getRadioListsController from '../../../../routers/context/getRadioLists';
import { getRadioLists } from '../../../../module';

jest.mock('../../../../module');

describe('routers/context/getRadioLists', () => {
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

  test('should call getRadioLists with default props', async () => {
    (getRadioLists as jest.Mock).mockResolvedValue({ status: 200, body: { code: 0, data: {} } });

    await getRadioListsController(mockCtx, mockNext);

    expect(getRadioLists).toHaveBeenCalledWith({
      method: 'get',
      params: {},
      option: {}
    });
  });

  test('should assign response to ctx', async () => {
    const mockResponse = {
      status: 200,
      body: { code: 0, data: { radioLists: [] } }
    };
    (getRadioLists as jest.Mock).mockResolvedValue(mockResponse);

    await getRadioListsController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({ code: 0, data: { radioLists: [] } });
  });

  test('should handle errors from getRadioLists', async () => {
    const mockError = new Error('Radio lists error');
    (getRadioLists as jest.Mock).mockRejectedValue(mockError);

    await expect(getRadioListsController(mockCtx, mockNext)).rejects.toThrow('Radio lists error');
  });
});
