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
      query: {}
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
        data: expect.any(String)
      },
      option: {}
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
    const fixedDate = new Date('2023-01-05T12:00:00Z'); // fixed, deterministic date
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
      response: mockResponse
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
      uin: 0
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
        period: expect.any(String)
      }
    });
  });

  test('should normalize song_mid from mid field in song list', async () => {
    const mockResponse = {
      req_1: {
        data: {
          data: {
            songInfoList: [
              { songId: 123, mid: 'test_mid_1', songName: 'Song 1' },
              { songId: 456, mid: 'test_mid_2', songName: 'Song 2' }
            ]
          }
        }
      }
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
              { songId: 123, mid: 'test_mid_1', songName: 'Song 1' }
            ]
          }
        }
      }
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
              { songId: 123, song_mid: 'existing_mid', songName: 'Song 1' }
            ]
          }
        }
      }
    };
    (UCommon as Mock).mockResolvedValue({ data: mockResponse });

    await getRanksController(mockCtx, mockNext);

    const songList = mockCtx.body.response.req_1.data.data.songInfoList;
    expect(songList[0].song_mid).toBe('existing_mid');
    expect(songList[0].mid).toBe('existing_mid');
  });

  test('should handle song list in different response paths', async () => {
    const mockResponse = {
      req_1: {
        data: {
          songList: [
            { songId: 123, mid: 'test_mid', songName: 'Song 1' }
          ]
        }
      }
    };
    (UCommon as Mock).mockResolvedValue({ data: mockResponse });

    await getRanksController(mockCtx, mockNext);

    const songList = mockCtx.body.response.req_1.data.songList;
    expect(songList[0].song_mid).toBe('test_mid');
  });
});

function getWeekNumber(d: Date): number {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
