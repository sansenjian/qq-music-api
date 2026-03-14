import getMvByTagController from '../../../../routers/context/getMvByTag';
import { getMvByTag } from '../../../../module';

jest.mock('../../../../module');

describe('routers/context/getMvByTag', () => {
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

  test('should call getMvByTag with default props', async () => {
    (getMvByTag as jest.Mock).mockResolvedValue({ status: 200, body: { code: 0, data: {} } });

    await getMvByTagController(mockCtx, mockNext);

    expect(getMvByTag).toHaveBeenCalledWith({
      method: 'get',
      params: {},
      option: {}
    });
  });

  test('should assign response to ctx', async () => {
    const mockResponse = {
      status: 200,
      body: { code: 0, data: { mvLists: [] } }
    };
    (getMvByTag as jest.Mock).mockResolvedValue(mockResponse);

    await getMvByTagController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({ code: 0, data: { mvLists: [] } });
  });

  test('should handle errors from getMvByTag', async () => {
    const mockError = new Error('MV by tag error');
    (getMvByTag as jest.Mock).mockRejectedValue(mockError);

    await expect(getMvByTagController(mockCtx, mockNext)).rejects.toThrow('MV by tag error');
  });
});
