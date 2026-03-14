// 推荐功能 API 测试

jest.mock('axios', () => {
  const service = Object.assign(
    jest.fn().mockResolvedValue({ data: { code: 0, data: {} } }),
    {
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    }
  );

  return {
    get: service,
    post: service,
    create: jest.fn(() => service),
    defaults: {
      withCredentials: true,
      timeout: 10000,
      headers: { post: {} },
      responseType: 'json'
    }
  };
});

import request from 'supertest';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import router from '../../../routers/router';
import cors from '../../../middlewares/koa-cors';
import type { UserInfo } from '../../../types/global';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const axios = require('axios');
const mockFn = axios.create() as jest.Mock & {
  interceptors?: {
    request: { use: jest.Mock }
    response: { use: jest.Mock }
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface AnyMiddleware extends Function {
  (ctx: any, next: () => Promise<unknown>): Promise<void>;
}

function createTestApp(): Koa {
  const app = new Koa();
  app.use(cors() as AnyMiddleware);
  app.use(bodyParser() as AnyMiddleware);
  app.use(router.routes());
  app.use(router.allowedMethods());
  return app;
}

function createTestUserInfo(): UserInfo {
  return {
    loginUin: '123456',
    cookie: 'test_cookie=123',
    cookieList: ['test_cookie=123'],
    cookieObject: { test_cookie: '123' },
    refreshData: () => {}
  };
}

function getLatestRequestOptions() {
  const latestCall = mockFn.mock.calls[mockFn.mock.calls.length - 1] || [];
  return latestCall[0] || {};
}

function getLatestRequestCookie() {
  const headers = (getLatestRequestOptions().headers || {}) as Record<string, string>;
  return headers.Cookie || headers.cookie;
}

function getLatestRequestPayload() {
  const latestOptions = getLatestRequestOptions();
  return latestOptions.data ? JSON.parse(latestOptions.data) : null;
}

describe('推荐功能 API 测试', () => {
  let app: Koa;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let callback: any;

  beforeAll(() => {
    app = createTestApp();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback = (app as any).callback();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockFn.mockReset();
    mockFn.mockResolvedValue({ data: { code: 0, data: {} } });
    global.userInfo = createTestUserInfo();
  });

  describe('GET /getDailyRecommend', () => {
    test('应该返回每日推荐歌曲', async () => {
      mockFn.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            recommend: {
              playlist: [
                { id: '1', name: '推荐歌曲 1' },
                { id: '2', name: '推荐歌曲 2' }
              ]
            }
          }
        }
      });

      const response = await request(callback).get('/getDailyRecommend').expect(200);

      expect(response.body).toHaveProperty('response');
      expect(response.body.response).toHaveProperty('code', 0);
    }, 10000);

    test('应该支持 cookie 参数', async () => {
      mockFn.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            recommend: {
              playlist: [{ id: '1', name: '个性化推荐' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getDailyRecommend')
        .query({ cookie: 'test_cookie=value' })
        .expect(200);

      expect(response.body).toHaveProperty('response');
      expect(getLatestRequestCookie()).toBe('test_cookie=value');
    }, 10000);

    test('应该处理上游错误响应', async () => {
      mockFn.mockRejectedValueOnce(new Error('network error'));

      const response = await request(callback).get('/getDailyRecommend').expect(500);

      expect(response.body).toHaveProperty('error');
    }, 10000);
  });

  describe('GET /getPrivateFM', () => {
    test('应该返回私人 FM 歌曲', async () => {
      mockFn.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            fm: {
              songlist: [
                { id: '1', name: 'FM 歌曲 1' },
                { id: '2', name: 'FM 歌曲 2' }
              ]
            }
          }
        }
      });

      const response = await request(callback).get('/getPrivateFM').expect(200);

      expect(response.body).toHaveProperty('response');
      expect(response.body.response).toHaveProperty('code', 0);
    }, 10000);

    test('应该支持 cookie 参数', async () => {
      mockFn.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            fm: {
              songlist: [{ id: '1', name: '个性化 FM' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getPrivateFM')
        .query({ cookie: 'test_cookie=value' })
        .expect(200);

      expect(response.body).toHaveProperty('response');
      expect(getLatestRequestCookie()).toBe('test_cookie=value');
    }, 10000);

    test('应该处理网络错误', async () => {
      mockFn.mockRejectedValueOnce(new Error('fetch failed'));

      const response = await request(callback).get('/getPrivateFM').expect(500);

      expect(response.body).toHaveProperty('error');
    }, 10000);
  });

  describe('GET /getNewSongs', () => {
    test('应该返回新歌列表（默认参数）', async () => {
      mockFn.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            new_song: {
              songlist: [
                { id: '1', name: '新歌 1' },
                { id: '2', name: '新歌 2' }
              ]
            }
          }
        }
      });

      const response = await request(callback).get('/getNewSongs').expect(200);
      const payload = getLatestRequestPayload();

      expect(response.body).toHaveProperty('response');
      expect(response.body.response).toHaveProperty('code', 0);
      expect(payload).toHaveProperty('new_song');
      expect(payload.new_song.module).toBe('newsong.NewSongServer');
      expect(payload.new_song.method).toBe('get_new_song_info');
      expect(payload.new_song.param.type).toBe(5);  // 默认类型为 5
      expect(payload.new_song.param.num).toBe(20);
    }, 10000);

    test('应该将 areaId 映射到已验证的新歌类型参数', async () => {
      mockFn.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            new_song: {
              songlist: [{ id: '1', name: '港台新歌' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getNewSongs')
        .query({ areaId: '2' })
        .expect(200);
      const payload = getLatestRequestPayload();

      expect(response.body).toHaveProperty('response');
      expect(payload.new_song.param.type).toBe(2);
      expect(payload.new_song.param.num).toBe(20);
    }, 10000);

    test('应该支持 limit 参数并透传到上游 payload', async () => {
      mockFn.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            new_song: {
              songlist: Array(50).fill({ id: '1', name: '新歌' })
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getNewSongs')
        .query({ areaId: '1', limit: '50' })
        .expect(200);
      
      const payload = getLatestRequestPayload();

      expect(response.body).toHaveProperty('response');
      expect(payload.new_song.param.type).toBe(1);
      expect(payload.new_song.param.num).toBe(50);
    }, 10000);

    test('应该在无效 areaId 时回退到默认新歌类型', async () => {
      const response = await request(callback)
        .get('/getNewSongs')
        .query({ areaId: 'invalid' })
        .expect(200);
      const payload = getLatestRequestPayload();

      expect(response.body).toBeDefined();
      expect(payload.new_song.param.type).toBe(5);
      expect(payload.new_song.param.num).toBe(20);
    }, 10000);
  });

  describe('GET /getPersonalRecommend', () => {
    test('应该返回个性化推荐（默认类型）', async () => {
      mockFn.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            recomPlaylist: {
              v_playlist: [
                { id: '1', name: '推荐歌单 1' },
                { id: '2', name: '推荐歌单 2' }
              ]
            }
          }
        }
      });

      const response = await request(callback).get('/getPersonalRecommend').expect(200);

      expect(response.body).toHaveProperty('response');
      expect(response.body.response).toHaveProperty('code', 0);
      expect(getLatestRequestPayload()).toHaveProperty('recomPlaylist');
    }, 10000);

    test('应该根据 type=2 切换到电台推荐请求', async () => {
      mockFn.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            radio: {
              list: [{ id: '1', title: '电台推荐' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getPersonalRecommend')
        .query({ type: '2' })
        .expect(200);
      
      const payload = getLatestRequestPayload();

      expect(response.body).toHaveProperty('response');
      expect(payload).toHaveProperty('radio');
      expect(payload).not.toHaveProperty('recomPlaylist');
      // 验证完整的 RPC 元信息（根据实际实现）
      expect(payload.radio.module).toBe('pf.radiosvr');
      expect(payload.radio.method).toBe('get_radio_list');
      expect(payload.radio.param).toHaveProperty('page_offset', 1);
      expect(payload.radio.param).toHaveProperty('page_size', 20);
    }, 10000);

    test('应该根据 type=3 切换到 MV 推荐请求', async () => {
      mockFn.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            mv: {
              list: [{ id: '1', title: 'MV 推荐' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getPersonalRecommend')
        .query({ type: '3' })
        .expect(200);
      
      const payload = getLatestRequestPayload();

      expect(response.body).toHaveProperty('response');
      expect(payload).toHaveProperty('mv');
      expect(payload).not.toHaveProperty('recomPlaylist');
      // 验证完整的 RPC 元信息（根据实际实现）
      expect(payload.mv.module).toBe('gosrf.Stream.MvUrlProxy');
      expect(payload.mv.method).toBe('GetRecommendMV');
      expect(payload.mv.param).toHaveProperty('size', 20);
    }, 10000);

    test('应该在非法 type 时回退到默认歌单推荐', async () => {
      mockFn.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            recomPlaylist: {
              v_playlist: [{ id: '1', name: '默认推荐' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getPersonalRecommend')
        .query({ type: '999' })
        .expect(200);

      expect(response.body).toHaveProperty('response');
      expect(getLatestRequestPayload()).toHaveProperty('recomPlaylist');
    }, 10000);

    test('应该支持 cookie 参数', async () => {
      mockFn.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            recomPlaylist: {
              v_playlist: [{ id: '1', name: '个性化推荐' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getPersonalRecommend')
        .query({ type: '1', cookie: 'user_cookie=value' })
        .expect(200);

      expect(response.body).toHaveProperty('response');
      expect(getLatestRequestCookie()).toBe('user_cookie=value');
    }, 10000);

    test('应该处理上游错误', async () => {
      mockFn.mockRejectedValueOnce(new Error('service unavailable'));

      const response = await request(callback).get('/getPersonalRecommend').expect(500);

      expect(response.body).toHaveProperty('error');
    }, 10000);
  });

  describe('GET /getSimilarSongs', () => {
    test('应该返回相似歌曲', async () => {
      mockFn.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            similarSong: {
              song: [
                { id: '1', name: '相似歌曲 1' },
                { id: '2', name: '相似歌曲 2' }
              ]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getSimilarSongs')
        .query({ songmid: 'test123' })
        .expect(200);
      const payload = getLatestRequestPayload();

      expect(response.body).toHaveProperty('response');
      expect(response.body.response).toHaveProperty('code', 0);
      expect(payload).toHaveProperty('similarSong');
      expect(payload.similarSong.method).toBe('get_similar_song_info');
      expect(payload.similarSong.module).toBe('music.web_srf_svr');
      expect(payload.similarSong.param.songmid).toBe('test123');
      expect(payload.similarSong.param.num).toBe(20);
    }, 10000);

    test('应该要求 songmid 参数', async () => {
      const response = await request(callback).get('/getSimilarSongs').expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('songmid');
    }, 10000);

    test('应该处理空字符串 songmid 参数', async () => {
      const response = await request(callback)
        .get('/getSimilarSongs')
        .query({ songmid: '' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('songmid');
    }, 10000);

    test('应该处理数组类型 songmid 参数', async () => {
      mockFn.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            similarSong: {
              song: [{ id: '1', name: '相似歌曲' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getSimilarSongs')
        .query({ songmid: ['test1', 'test2'] })
        .expect(200);
      
      const payload = getLatestRequestPayload();

      expect(response.body).toHaveProperty('response');
      // 数组类型会取第一个值
      expect(payload.similarSong.param.songmid).toBe('test1');
    }, 10000);

    test('应该处理数字类型 songmid 参数', async () => {
      mockFn.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            similarSong: {
              song: [{ id: '1', name: '相似歌曲' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getSimilarSongs')
        .query({ songmid: 12345 })
        .expect(200);
      const payload = getLatestRequestPayload();

      expect(response.body).toHaveProperty('response');
      expect(payload.similarSong.param.songmid).toBe('12345');
    }, 10000);

    test('应该支持 cookie 参数', async () => {
      mockFn.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            similarSong: {
              song: [{ id: '1', name: '相似歌曲' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getSimilarSongs')
        .query({ songmid: 'test123', cookie: 'user_cookie=value' })
        .expect(200);

      expect(response.body).toHaveProperty('response');
      expect(getLatestRequestCookie()).toBe('user_cookie=value');
    }, 10000);

    test('应该处理不同的 songmid 格式', async () => {
      mockFn.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            similarSong: {
              song: [{ id: '1', name: '相似歌曲' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getSimilarSongs')
        .query({ songmid: '003rJSwm3TechU' })
        .expect(200);
      const payload = getLatestRequestPayload();

      expect(response.body).toHaveProperty('response');
      expect(payload.similarSong.param.songmid).toBe('003rJSwm3TechU');
    }, 10000);

    test('应该处理网络错误', async () => {
      mockFn.mockRejectedValueOnce(new Error('connection timeout'));

      const response = await request(callback)
        .get('/getSimilarSongs')
        .query({ songmid: 'test123' })
        .expect(500);

      expect(response.body).toHaveProperty('error');
    }, 10000);
  });

  describe('错误处理和边界情况', () => {
    test('应该返回 404 对于未知路由', async () => {
      await request(callback).get('/unknown-recommend').expect(404);
    });

    test('应该处理上游返回非 0 code', async () => {
      mockFn.mockResolvedValueOnce({
        data: {
          code: 1000,
          msg: '参数错误'
        }
      });

      const response = await request(callback).get('/getDailyRecommend').expect(200);

      expect(response.body.response.code).toBe(1000);
      expect(response.body.response.msg).toBe('参数错误');
    });

    test('应该处理空响应数据', async () => {
      mockFn.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {}
        }
      });

      const response = await request(callback).get('/getDailyRecommend').expect(200);

      expect(response.body.response.code).toBe(0);
    });

    test('应该处理超时错误', async () => {
      mockFn.mockRejectedValueOnce(new Error('timeout'));

      const response = await request(callback).get('/getDailyRecommend').expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });
});
