import type { Mock } from 'vitest';
import getRanksController from '../../../src/controllers/getRanks';
import { UCommon } from '../../../src/services';

vi.mock('../../../src/services');

describe('controllers/getRanks', () => {
  let mockCtx: any;
  let mockNext: Mock;
  let consoleErrorSpy: any;

  beforeEach(() => {
    mockCtx = {
      status: 200,
      body: null,
      query: {},
    };
    mockNext = vi.fn();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('should call UCommon with default parameters', async () => {
    (UCommon as Mock).mockResolvedValue({ data: {} });

    await getRanksController(mockCtx, mockNext);

    expect(UCommon).toHaveBeenCalledWith({
      method: 'get',
      params: {
        format: 'json',
        data: expect.any(String),
      },
      option: {},
    });
  });

  test('should use default topId value of 4', async () => {
    mockCtx.query = {};
    (UCommon as Mock).mockResolvedValue({ data: {} });

    await getRanksController(mockCtx, mockNext);

    const callArgs = (UCommon as Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);

    expect(dataParam.req_1.param.topId).toBe(4);
  });

  test('should accept custom topId parameter', async () => {
    mockCtx.query = { topId: '10' };
    (UCommon as Mock).mockResolvedValue({ data: {} });

    await getRanksController(mockCtx, mockNext);

    const callArgs = (UCommon as Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);

    expect(dataParam.req_1.param.topId).toBe(10);
  });

  test('should use default limit value of 20', async () => {
    mockCtx.query = {};
    (UCommon as Mock).mockResolvedValue({ data: {} });

    await getRanksController(mockCtx, mockNext);

    const callArgs = (UCommon as Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);

    expect(dataParam.req_1.param.num).toBe(20);
  });

  test('should accept custom limit parameter', async () => {
    mockCtx.query = { limit: '50' };
    (UCommon as Mock).mockResolvedValue({ data: {} });

    await getRanksController(mockCtx, mockNext);

    const callArgs = (UCommon as Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);

    expect(dataParam.req_1.param.num).toBe(50);
  });

  test('should use default page value of 0', async () => {
    mockCtx.query = {};
    (UCommon as Mock).mockResolvedValue({ data: {} });

    await getRanksController(mockCtx, mockNext);

    const callArgs = (UCommon as Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);

    expect(dataParam.req_1.param.offset).toBe(0);
  });

  test('should accept custom page parameter', async () => {
    mockCtx.query = { page: '5' };
    (UCommon as Mock).mockResolvedValue({ data: {} });

    await getRanksController(mockCtx, mockNext);

    const callArgs = (UCommon as Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);

    expect(dataParam.req_1.param.offset).toBe(5);
  });

  test('should calculate week number correctly', async () => {
    const fixedDate = new Date('2023-01-05T12:00:00Z');
    vi.useFakeTimers().setSystemTime(fixedDate);

    try {
      mockCtx.query = {};
      (UCommon as Mock).mockResolvedValue({ data: {} });

      await getRanksController(mockCtx, mockNext);

      const callArgs = (UCommon as Mock).mock.calls[0][0];
      const dataParam = JSON.parse(callArgs.params.data);

      const expectedWeek = getWeekNumber(fixedDate);
      const expectedPeriod = `${fixedDate.getFullYear()}_${expectedWeek}`;

      expect(dataParam.req_1.param.period).toBe(expectedPeriod);
    } finally {
      vi.useRealTimers();
    }
  });

  test('should set response on successful API call', async () => {
    const mockResponse = { code: 0, data: { topList: [] } };
    (UCommon as Mock).mockResolvedValue({ data: mockResponse });

    await getRanksController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({
      response: mockResponse,
    });
  });

  test('should handle API errors gracefully', async () => {
    (UCommon as Mock).mockRejectedValue(new Error('API error'));

    await getRanksController(mockCtx, mockNext);

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(mockCtx.status).toBe(502);
    expect(mockCtx.body).toEqual({ error: '上游服务异常' });
  });

  test('should have correct comm structure', async () => {
    (UCommon as Mock).mockResolvedValue({ data: {} });

    await getRanksController(mockCtx, mockNext);

    const callArgs = (UCommon as Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);

    expect(dataParam.comm).toMatchObject({
      ct: 24,
      cv: 4747474,
      format: 'json',
      inCharset: 'utf-8',
      needNewCode: 1,
      uin: 0,
    });
  });

  test('should have correct req_1 module config', async () => {
    mockCtx.query = { topId: '10', limit: '30', page: '2' };
    (UCommon as Mock).mockResolvedValue({ data: {} });

    await getRanksController(mockCtx, mockNext);

    const callArgs = (UCommon as Mock).mock.calls[0][0];
    const dataParam = JSON.parse(callArgs.params.data);

    expect(dataParam.req_1).toMatchObject({
      module: 'musicToplist.ToplistInfoServer',
      method: 'GetDetail',
      param: {
        topId: 10,
        offset: 2,
        num: 30,
        period: expect.any(String),
      },
    });
  });

  test('should normalize song_mid from mid field in song list', async () => {
    const mockResponse = {
      req_1: {
        data: {
          data: {
            songInfoList: [
              { songId: 123, mid: 'test_mid_1', songName: 'Song 1' },
              { songId: 456, mid: 'test_mid_2', songName: 'Song 2' },
            ],
          },
        },
      },
    };
    (UCommon as Mock).mockResolvedValue({ data: mockResponse });

    await getRanksController(mockCtx, mockNext);

    const songList = mockCtx.body.response.req_1.data.data.songInfoList;
    expect(songList[0].song_mid).toBe('test_mid_1');
    expect(songList[0].mid).toBe('test_mid_1');
    expect(songList[1].song_mid).toBe('test_mid_2');
    expect(songList[1].mid).toBe('test_mid_2');
  });

  test('should normalize song_id from songId field in song list', async () => {
    const mockResponse = {
      req_1: {
        data: {
          data: {
            songInfoList: [
              { songId: 123, mid: 'test_mid_1', songName: 'Song 1' },
            ],
          },
        },
      },
    };
    (UCommon as Mock).mockResolvedValue({ data: mockResponse });

    await getRanksController(mockCtx, mockNext);

    const songList = mockCtx.body.response.req_1.data.data.songInfoList;
    expect(songList[0].song_id).toBe(123);
    expect(songList[0].songId).toBe(123);
  });

  test('should normalize song_id from id field in song list', async () => {
    const mockResponse = {
      req_1: {
        data: {
          data: {
            songInfoList: [
              { id: 123, mid: 'test_mid_1', songName: 'Song 1' },
            ],
          },
        },
      },
    };
    (UCommon as Mock).mockResolvedValue({ data: mockResponse });

    await getRanksController(mockCtx, mockNext);

    const songList = mockCtx.body.response.req_1.data.data.songInfoList;
    expect(songList[0].song_id).toBe(123);
    expect(songList[0].songId).toBe(123);
  });

  test('should preserve existing song_mid field', async () => {
    const mockResponse = {
      req_1: {
        data: {
          data: {
            songInfoList: [
              { songId: 123, song_mid: 'existing_mid', songName: 'Song 1' },
            ],
          },
        },
      },
    };
    (UCommon as Mock).mockResolvedValue({ data: mockResponse });

    await getRanksController(mockCtx, mockNext);

    const songList = mockCtx.body.response.req_1.data.data.songInfoList;
    expect(songList[0].song_mid).toBe('existing_mid');
    expect(songList[0].mid).toBe('existing_mid');
  });

  test('should NOT auto-resolve song_mid by default even when only songId is present', async () => {
    const rankResponse = {
      req_1: {
        data: {
          data: {
            songInfoList: [
              { songId: 123, songName: 'Song without mid' },
            ],
          },
        },
      },
    };

    (UCommon as Mock).mockResolvedValue({ data: rankResponse });

    await getRanksController(mockCtx, mockNext);

    expect(UCommon).toHaveBeenCalledTimes(1);
    const songList = mockCtx.body.response.req_1.data.data.songInfoList;
    expect(songList[0].songId).toBe(123);
    expect(songList[0].song_mid).toBeUndefined();
    expect(songList[0].mid).toBeUndefined();
  });

  test('should populate song_mid via detail API when resolveMid=true', async () => {
    mockCtx.query = { resolveMid: 'true' };

    const rankResponse = {
      req_1: {
        data: {
          data: {
            songInfoList: [
              { songId: 123, songName: 'Song without mid' },
            ],
          },
        },
      },
    };

    const detailResponse = {
      songinfo: {
        data: {
          track_info: {
            mid: 'detail_mid_123',
          },
        },
      },
    };

    (UCommon as Mock)
      .mockResolvedValueOnce({ data: rankResponse })
      .mockResolvedValueOnce({ data: detailResponse });

    await getRanksController(mockCtx, mockNext);

    expect(UCommon).toHaveBeenCalledTimes(2);
    const detailCall = (UCommon as Mock).mock.calls[1][0];
    expect(detailCall.params.data).toEqual(expect.any(String));
    expect(JSON.parse(detailCall.params.data).songinfo.param.song_id).toBe(123);
    const songList = mockCtx.body.response.req_1.data.data.songInfoList;
    expect(songList[0].songId).toBe(123);
    expect(songList[0].song_mid).toBe('detail_mid_123');
    expect(songList[0].mid).toBe('detail_mid_123');
  });

  test('should log error when song detail API fails during resolveMid=true', async () => {
    mockCtx.query = { resolveMid: 'true' };

    const rankResponse = {
      req_1: {
        data: {
          data: {
            songInfoList: [
              { songId: 123, songName: 'Song 1' },
            ],
          },
        },
      },
    };

    (UCommon as Mock)
      .mockResolvedValueOnce({ data: rankResponse })
      .mockRejectedValueOnce(new Error('song detail failed'));

    await getRanksController(mockCtx, mockNext);

    const songList = mockCtx.body.response.req_1.data.data.songInfoList;
    expect(songList[0].songId).toBe(123);
    expect(songList[0].song_mid).toBeUndefined();
    expect(songList[0].mid).toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  test('should keep song_mid undefined when detail API returns empty payload', async () => {
    mockCtx.query = { resolveMid: 'true' };

    const rankResponse = {
      req_1: {
        data: {
          data: {
            songInfoList: [
              { songId: 123, songName: 'Song 1' },
            ],
          },
        },
      },
    };

    const emptyDetailResponse = {};

    (UCommon as Mock)
      .mockResolvedValueOnce({ data: rankResponse })
      .mockResolvedValueOnce({ data: emptyDetailResponse });

    await getRanksController(mockCtx, mockNext);

    const songList = mockCtx.body.response.req_1.data.data.songInfoList;
    expect(songList[0].songId).toBe(123);
    expect(songList[0].song_mid).toBeUndefined();
    expect(songList[0].mid).toBeUndefined();
  });

  test('should skip detail API calls when song already has mid', async () => {
    mockCtx.query = { resolveMid: 'true' };

    const mockResponse = {
      req_1: {
        data: {
          data: {
            songInfoList: [
              { songId: 123, mid: 'already_have_mid', songName: 'Song 1' },
            ],
          },
        },
      },
    };
    (UCommon as Mock).mockResolvedValue({ data: mockResponse });

    await getRanksController(mockCtx, mockNext);

    expect(UCommon).toHaveBeenCalledTimes(1);
  });

  test('should handle song list at data.songList path', async () => {
    const mockResponse = {
      req_1: {
        data: {
          songList: [
            { songId: 123, mid: 'test_mid', songName: 'Song 1' },
          ],
        },
      },
    };
    (UCommon as Mock).mockResolvedValue({ data: mockResponse });

    await getRanksController(mockCtx, mockNext);

    const songList = mockCtx.body.response.req_1.data.songList;
    expect(songList[0].song_mid).toBe('test_mid');
  });

  test('should handle song list at data.data.song_info_list path', async () => {
    const mockResponse = {
      req_1: {
        data: {
          data: {
            song_info_list: [
              { songId: 123, mid: 'test_mid', songName: 'Song 1' },
            ],
          },
        },
      },
    };
    (UCommon as Mock).mockResolvedValue({ data: mockResponse });

    await getRanksController(mockCtx, mockNext);

    const songList = mockCtx.body.response.req_1.data.data.song_info_list;
    expect(songList[0].song_mid).toBe('test_mid');
  });

  test('should handle song list at data.song_list path', async () => {
    const mockResponse = {
      req_1: {
        data: {
          song_list: [
            { songId: 123, mid: 'test_mid', songName: 'Song 1' },
          ],
        },
      },
    };
    (UCommon as Mock).mockResolvedValue({ data: mockResponse });

    await getRanksController(mockCtx, mockNext);

    const songList = mockCtx.body.response.req_1.data.song_list;
    expect(songList[0].song_mid).toBe('test_mid');
  });

  test('should handle songId of value 0 with resolveMid=true', async () => {
    mockCtx.query = { resolveMid: 'true' };

    const rankResponse = {
      req_1: {
        data: {
          data: {
            songInfoList: [
              { songId: 0, songName: 'Edge case song' },
            ],
          },
        },
      },
    };

    const detailResponse = {
      songinfo: {
        data: {
          track_info: {
            mid: 'mid_for_zero',
          },
        },
      },
    };

    (UCommon as Mock)
      .mockResolvedValueOnce({ data: rankResponse })
      .mockResolvedValueOnce({ data: detailResponse });

    await getRanksController(mockCtx, mockNext);

    const songList = mockCtx.body.response.req_1.data.data.songInfoList;
    expect(songList[0].songId).toBe(0);
    expect(songList[0].song_mid).toBe('mid_for_zero');
    expect(songList[0].mid).toBe('mid_for_zero');
  });

  test('should deduplicate song detail requests and cap resolveMid concurrency', async () => {
    mockCtx.query = { resolveMid: 'true' };

    const songInfoList = [1, 2, 3, 4, 5, 6, 7, 1].map(songId => ({ songId }));
    const rankResponse = { req_1: { data: { data: { songInfoList } } } };
    let activeRequests = 0;
    let maxActiveRequests = 0;

    (UCommon as Mock).mockResolvedValueOnce({ data: rankResponse }).mockImplementation(async ({ params }) => {
      activeRequests += 1;
      maxActiveRequests = Math.max(maxActiveRequests, activeRequests);
      await new Promise(resolve => setTimeout(resolve, 5));
      activeRequests -= 1;

      const songId = JSON.parse(params.data).songinfo.param.song_id;
      return { data: { songinfo: { data: { track_info: { mid: `mid_${songId}` } } } } };
    });

    await getRanksController(mockCtx, mockNext);

    expect(UCommon).toHaveBeenCalledTimes(8);
    expect(maxActiveRequests).toBe(5);
    expect(mockCtx.body.response.req_1.data.data.songInfoList.map((song: any) => song.mid)).toEqual([
      'mid_1',
      'mid_2',
      'mid_3',
      'mid_4',
      'mid_5',
      'mid_6',
      'mid_7',
      'mid_1',
    ]);
  });
});

function getWeekNumber(d: Date): number {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
