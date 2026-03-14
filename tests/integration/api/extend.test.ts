// 扩展功能 API 测试

import request from 'supertest';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import router from '../../../routers/router';
import cors from '../../../middlewares/koa-cors';
import type { UserInfo } from '../../../types/global';

// Mock axios 模块
jest.mock('axios', () => {
  const mockFn = jest.fn().mockResolvedValue({ data: { code: 0, data: {} } });
  (mockFn as jest.Mock & { interceptors: object }).interceptors = {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  };
  return {
    get: mockFn,
    post: mockFn,
    create: jest.fn(() => mockFn),
    defaults: {
      withCredentials: true,
      timeout: 10000,
      headers: { post: {} },
      responseType: 'json'
    }
  };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const axios = require('axios');

interface AnyMiddleware {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

describe('扩展功能 API 测试', () => {
  let app: Koa;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let callback: any;
  let mockService: jest.Mock;

  beforeAll(() => {
    app = createTestApp();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback = (app as any).callback();
    mockService = axios.create();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockService.mockResolvedValue({ data: { code: 0, data: {} } });
    global.userInfo = createTestUserInfo();
  });

  describe('GET /getPlaylistTags', () => {
    test('应该返回歌单标签列表', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            playlist: {
              tags: [
                { id: 1, name: '华语' },
                { id: 2, name: '欧美' },
                { id: 3, name: '韩语' },
                { id: 4, name: '日语' }
              ]
            }
          }
        }
      });

      const response = await request(callback).get('/getPlaylistTags').expect(200);

      // response.body.response 应该是整个 mock 返回的 data 对象
      expect(response.body.response).toBeDefined();
      expect(response.body.response.code).toBe(0);
      expect(response.body.response.data).toBeDefined();
      expect(response.body.response.data.playlist).toBeDefined();
    }, 10000);

    test('应该处理网络错误', async () => {
      mockService.mockRejectedValueOnce(new Error('network error'));

      const response = await request(callback).get('/getPlaylistTags').expect(500);

      expect(response.body).toBeDefined();
    }, 10000);

    test('应该处理上游返回非 0 code', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 1000,
          msg: '参数错误'
        }
      });

      const response = await request(callback).get('/getPlaylistTags').expect(200);

      // response.body.response 是 mock 返回的 data 对象
      expect(response.body.response.code).toBe(1000);
      expect(response.body.response.msg).toBe('参数错误');
    }, 10000);
  });

  describe('GET /getPlaylistsByTag', () => {
    test('应该返回标签歌单列表（默认参数）', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            playlist: {
              v_playlist: [
                { id: '1', name: '歌单 1' },
                { id: '2', name: '歌单 2' }
              ]
            }
          }
        }
      });

      const response = await request(callback).get('/getPlaylistsByTag').expect(200);

      // response.body.response 是 mock 返回的 data 对象
      expect(response.body.response).toBeDefined();
      expect(response.body.response.code).toBe(0);
      expect(response.body.response.data.playlist).toBeDefined();
    }, 10000);

    test('应该支持 tagId 参数', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            playlist: {
              v_playlist: [{ id: '1', name: '华语歌单' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getPlaylistsByTag')
        .query({ tagId: '2' })
        .expect(200);

      expect(response.body.response).toBeDefined();
      expect(response.body.response.code).toBe(0);
      expect(response.body.response.data.playlist).toBeDefined();
    }, 10000);

    test('应该支持 page 参数', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            playlist: {
              v_playlist: Array(20).fill({ id: '1', name: '歌单' })
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getPlaylistsByTag')
        .query({ page: '1' })
        .expect(200);

      expect(response.body.response).toBeDefined();
    }, 10000);

    test('应该支持 num 参数', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            playlist: {
              v_playlist: Array(50).fill({ id: '1', name: '歌单' })
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getPlaylistsByTag')
        .query({ num: '50' })
        .expect(200);

      expect(response.body.response).toBeDefined();
    }, 10000);

    test('应该支持组合参数', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            playlist: {
              v_playlist: [{ id: '1', name: '欧美歌单' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getPlaylistsByTag')
        .query({ tagId: '2', page: '1', num: '30' })
        .expect(200);

      expect(response.body.response).toBeDefined();
    }, 10000);

    test('应该处理无效参数', async () => {
      const response = await request(callback)
        .get('/getPlaylistsByTag')
        .query({ tagId: 'invalid' })
        .expect(200);

      // API 应该使用默认值或返回错误
      expect(response.body).toBeDefined();
    }, 10000);

    test('应该处理网络错误', async () => {
      mockService.mockRejectedValueOnce(new Error('fetch failed'));

      const response = await request(callback).get('/getPlaylistsByTag').expect(500);

      expect(response.body).toBeDefined();
    }, 10000);
  });

  describe('GET /getHotComments', () => {
    test('应该要求 id 参数', async () => {
      const response = await request(callback).get('/getHotComments').expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('id');
    }, 10000);

    test('应该返回热门评论（默认参数）', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            comment: {
              commentlist: [
                { id: '1', content: '评论 1', nick: '用户 1' },
                { id: '2', content: '评论 2', nick: '用户 2' }
              ]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getHotComments')
        .query({ id: 'test123' })
        .expect(200);

      // response.body.response 是 mock 返回的 data 对象
      expect(response.body.response).toBeDefined();
      expect(response.body.response.code).toBe(0);
      expect(response.body.response.data.comment).toBeDefined();
    }, 10000);

    test('应该支持 type 参数（歌曲评论）', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            comment: {
              commentlist: [{ id: '1', content: '歌曲评论' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getHotComments')
        .query({ id: 'song123', type: '1' })
        .expect(200);

      expect(response.body.response).toBeDefined();
    }, 10000);

    test('应该支持 type 参数（歌单评论）', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            comment: {
              commentlist: [{ id: '1', content: '歌单评论' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getHotComments')
        .query({ id: 'playlist123', type: '2' })
        .expect(200);

      expect(response.body.response).toBeDefined();
    }, 10000);

    test('应该支持 type 参数（专辑评论）', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            comment: {
              commentlist: [{ id: '1', content: '专辑评论' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getHotComments')
        .query({ id: 'album123', type: '3' })
        .expect(200);

      expect(response.body.response).toBeDefined();
    }, 10000);

    test('应该支持 page 参数', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            comment: {
              commentlist: Array(20).fill({ id: '1', content: '评论' })
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getHotComments')
        .query({ id: 'test123', page: '1' })
        .expect(200);

      expect(response.body.response).toBeDefined();
    }, 10000);

    test('应该支持 pagesize 参数', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            comment: {
              commentlist: Array(50).fill({ id: '1', content: '评论' })
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getHotComments')
        .query({ id: 'test123', pagesize: '50' })
        .expect(200);

      expect(response.body.response).toBeDefined();
    }, 10000);

    test('应该支持组合参数', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            comment: {
              commentlist: [{ id: '1', content: '热门评论' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getHotComments')
        .query({ id: 'test123', type: '1', page: '1', pagesize: '30' })
        .expect(200);

      expect(response.body.response).toBeDefined();
    }, 10000);

    test('应该处理不同的资源 ID 格式', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            comment: {
              commentlist: [{ id: '1', content: '评论' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getHotComments')
        .query({ id: '003rJSwm3TechU' })
        .expect(200);

      expect(response.body.response).toBeDefined();
    }, 10000);

    test('应该处理网络错误', async () => {
      mockService.mockRejectedValueOnce(new Error('connection timeout'));

      const response = await request(callback)
        .get('/getHotComments')
        .query({ id: 'test123' })
        .expect(500);

      expect(response.body).toBeDefined();
    }, 10000);
  });

  describe('GET /getSingerListByArea', () => {
    test('应该返回歌手列表（默认参数）', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            singer: {
              singers: [
                { id: '1', name: '歌手 1' },
                { id: '2', name: '歌手 2' }
              ]
            }
          }
        }
      });

      const response = await request(callback).get('/getSingerListByArea').expect(200);

      // response.body.response 是 mock 返回的 data 对象
      expect(response.body.response).toBeDefined();
      expect(response.body.response.code).toBe(0);
      expect(response.body.response.data.singer).toBeDefined();
    }, 10000);

    test('应该支持 area 参数（内地歌手）', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            singer: {
              singers: [{ id: '1', name: '内地歌手' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getSingerListByArea')
        .query({ area: '1' })
        .expect(200);

      expect(response.body.response).toBeDefined();
    }, 10000);

    test('应该支持 area 参数（港台歌手）', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            singer: {
              singers: [{ id: '1', name: '港台歌手' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getSingerListByArea')
        .query({ area: '2' })
        .expect(200);

      expect(response.body.response).toBeDefined();
    }, 10000);

    test('应该支持 area 参数（欧美歌手）', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            singer: {
              singers: [{ id: '1', name: '欧美歌手' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getSingerListByArea')
        .query({ area: '3' })
        .expect(200);

      expect(response.body.response).toBeDefined();
    }, 10000);

    test('应该支持 sex 参数（男歌手）', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            singer: {
              singers: [{ id: '1', name: '男歌手' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getSingerListByArea')
        .query({ sex: '1' })
        .expect(200);

      expect(response.body.response).toBeDefined();
    }, 10000);

    test('应该支持 sex 参数（女歌手）', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            singer: {
              singers: [{ id: '1', name: '女歌手' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getSingerListByArea')
        .query({ sex: '2' })
        .expect(200);

      expect(response.body.response).toBeDefined();
    }, 10000);

    test('应该支持 sex 参数（组合）', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            singer: {
              singers: [{ id: '1', name: '组合' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getSingerListByArea')
        .query({ sex: '3' })
        .expect(200);

      expect(response.body.response).toBeDefined();
    }, 10000);

    test('应该支持 genre 参数', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            singer: {
              singers: [{ id: '1', name: '流行歌手' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getSingerListByArea')
        .query({ genre: '1' })
        .expect(200);

      expect(response.body.response).toBeDefined();
    }, 10000);

    test('应该支持 page 参数', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            singer: {
              singers: Array(80).fill({ id: '1', name: '歌手' })
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getSingerListByArea')
        .query({ page: '2' })
        .expect(200);

      expect(response.body.response).toBeDefined();
    }, 10000);

    test('应该支持 pagesize 参数', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            singer: {
              singers: Array(50).fill({ id: '1', name: '歌手' })
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getSingerListByArea')
        .query({ pagesize: '50' })
        .expect(200);

      expect(response.body.response).toBeDefined();
    }, 10000);

    test('应该支持组合参数筛选', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            singer: {
              singers: [{ id: '1', name: '内地男歌手' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getSingerListByArea')
        .query({ area: '1', sex: '1', genre: '1', page: '1', pagesize: '50' })
        .expect(200);

      expect(response.body.response).toBeDefined();
    }, 10000);

    test('应该处理无效参数', async () => {
      const response = await request(callback)
        .get('/getSingerListByArea')
        .query({ area: 'invalid' })
        .expect(200);

      // API 应该使用默认值或返回错误
      expect(response.body).toBeDefined();
    }, 10000);

    test('应该处理网络错误', async () => {
      mockService.mockRejectedValueOnce(new Error('service unavailable'));

      const response = await request(callback).get('/getSingerListByArea').expect(500);

      expect(response.body).toBeDefined();
    }, 10000);
  });

  describe('错误处理和边界情况', () => {
    test('应该返回 404 对于未知路由', async () => {
      await request(callback).get('/unknown-extend').expect(404);
    });

    test('应该处理空响应数据', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {}
        }
      });

      const response = await request(callback).get('/getPlaylistTags').expect(200);

      // response.body.response 是 mock 返回的 data 对象
      expect(response.body.response.code).toBe(0);
      expect(response.body.response.data).toEqual({});
    });

    test('应该处理超时错误', async () => {
      mockService.mockRejectedValueOnce(new Error('timeout'));

      const response = await request(callback).get('/getPlaylistTags').expect(500);

      expect(response.body).toBeDefined();
    });

    test('应该处理并发请求', async () => {
      mockService.mockResolvedValue({
        data: {
          code: 0,
          data: { playlist: { tags: [] } }
        }
      });

      const requests = [
        request(callback).get('/getPlaylistTags'),
        request(callback).get('/getPlaylistsByTag'),
        request(callback).get('/getSingerListByArea')
      ];

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.response).toBeDefined();
      });
    }, 10000);
  });
});
