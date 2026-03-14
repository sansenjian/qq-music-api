import getAlbumInfo from '../../../module/apis/album/getAlbumInfo';
import { handleApi } from '../../../util/apiResponse';

jest.mock('../../../util/apiResponse');

describe('module/apis/album/getAlbumInfo', () => {
  const albumId = '00123456';

  beforeEach(() => {
    jest.clearAllMocks();
    (handleApi as jest.Mock).mockClear();
  });

  it('应调用 handleApi 并返回专辑信息', async () => {
    const mockResult = { data: { albumName: 'Test Album' } };
    (handleApi as jest.Mock).mockResolvedValue(mockResult);

    const result = await getAlbumInfo({ params: { albumId } });

    expect(handleApi).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockResult);
  });

  it('应接受 albumId 参数', async () => {
    await getAlbumInfo({ params: { albumId } });

    expect(handleApi).toHaveBeenCalledWith(expect.anything());
  });

  it('应处理 handleApi 抛出的错误', async () => {
    const mockError = new Error('album not found');
    (handleApi as jest.Mock).mockRejectedValue(mockError);

    await expect(getAlbumInfo({ params: { albumId } })).rejects.toThrow('album not found');
  });
});
