import getRecommendController from '../../../../routers/context/getRecommend';
import { UCommon } from '../../../../module';

jest.mock('../../../../module');

describe('routers/context/getRecommend', () => {
  let mockCtx: any;
  let mockNext: jest.Mock;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    mockCtx = {
      status: 200,
      body: null,
      query: {}
    };
    mockNext = jest.fn();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  test('should call UCommon with correct data structure', async () => {
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getRecommendController(mockCtx, mockNext);

    expect(UCommon).toHaveBeenCalledWith({
      method: 'get',
      params: {
        format: 'json',
        data: expect.any(String)
      },
      option: {}
    });
  });

  test('should set response on successful API call', async () => {
    const mockResponse = { code: 0, data: { playlists: [] } };
    (UCommon as jest.Mock).mockResolvedValue({ data: mockResponse });

    await getRecommendController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({
      response: mockResponse
    });
  });

  test('should handle API errors gracefully', async () => {
    (UCommon as jest.Mock).mockRejectedValue(new Error('API error'));

    await getRecommendController(mockCtx, mockNext);

    expect(consoleLogSpy).toHaveBeenCalledWith('error', expect.any(Error));
    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toBeNull();
  });

  test('should construct correct data structure with all modules', async () => {
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getRecommendController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam).toHaveProperty('comm');
    expect(dataParam).toHaveProperty('category');
    expect(dataParam).toHaveProperty('recomPlaylist');
    expect(dataParam).toHaveProperty('playlist');
    expect(dataParam).toHaveProperty('new_song');
    expect(dataParam).toHaveProperty('new_album');
    expect(dataParam).toHaveProperty('new_album_tag');
    expect(dataParam).toHaveProperty('toplist');
    expect(dataParam).toHaveProperty('focus');
  });

  test('should have correct comm structure', async () => {
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getRecommendController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.comm).toEqual({
      ct: 24
    });
  });

  test('should have correct category module config', async () => {
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getRecommendController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.category).toMatchObject({
      method: 'get_hot_category',
      param: {
        qq: ''
      },
      module: 'music.web_category_svr'
    });
  });

  test('should have correct recomPlaylist module config', async () => {
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getRecommendController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.recomPlaylist).toMatchObject({
      method: 'get_hot_recommend',
      param: {
        async: 1,
        cmd: 2
      },
      module: 'playlist.HotRecommendServer'
    });
  });

  test('should have correct playlist module config', async () => {
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getRecommendController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.playlist).toMatchObject({
      method: 'get_playlist_by_category',
      param: {
        id: 8,
        curPage: 1,
        size: 40,
        order: 5,
        titleid: 8
      },
      module: 'playlist.PlayListPlazaServer'
    });
  });

  test('should have correct new_song module config', async () => {
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getRecommendController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.new_song).toMatchObject({
      module: 'newsong.NewSongServer',
      method: 'get_new_song_info',
      param: {
        type: 5
      }
    });
  });

  test('should have correct new_album module config', async () => {
    (UCommon as jest.Mock).mockResolvedValue({ data: {} });

    await getRecommendController(mockCtx, mockNext);

    const callArgs = (UCommon as jest.Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);
    
    expect(dataParam.new_album).toMatchObject({
      module: 'newalbum.NewAlbumServer',
      method: 'get_new_album_info',
      param: {
        area: 1,
        sin: 0,
        num: 10
      }
    });
  });
});
