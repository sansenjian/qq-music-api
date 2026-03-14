import getHotKey from '../../../module/apis/search/getHotKey';
import { handleApi } from '../../../util/apiResponse';

jest.mock('../../../util/apiResponse');

describe('module/apis/search/getHotKey', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (handleApi as jest.Mock).mockClear();
  });

  it('应调用 handleApi 并返回搜索结果', async () => {
    const mockResult = { data: { hotkeys: [{ k: 'test' }] } };
    (handleApi as jest.Mock).mockResolvedValue(mockResult);

    const result = await getHotKey({});

    expect(handleApi).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockResult);
  });

  it('应处理 handleApi 抛出的错误', async () => {
    const mockError = new Error('search failed');
    (handleApi as jest.Mock).mockRejectedValue(mockError);

    await expect(getHotKey({})).rejects.toThrow('search failed');
  });
});
