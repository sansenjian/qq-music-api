// API 集成测试

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

interface FetchResponseOptions {
  ok?: boolean;
  text?: string;
  arrayBuffer?: Buffer;
  headers?: Record<string, string>;
  status?: number;
}

type ResponseBody = Record<string, unknown> & {
  response?: {
    code?: number;
    data?: Record<string, unknown> & {
      playlists?: Array<Record<string, unknown>>;
      avatarUrl?: string;
    };
    error?: string;
    playLists?: Record<string, string[]>;
  } | string;
  error?: string;
  isOk?: boolean;
  refresh?: boolean;
  message?: string;
  img?: string;
  ptqrtoken?: string;
  qrsig?: string;
  session?: {
    loginUin: string;
    cookie: string;
    cookieList: string[];
    cookieObject: Record<string, string>;
  };
  data?: unknown[];
  status?: number;
};

interface MockMvUrlEntry {
  freeflow_url: string[];
}

const createFetchResponse = ({
  ok = true,
  text = '',
  arrayBuffer = Buffer.from(''),
  headers = {},
  status = 200
}: FetchResponseOptions = {}) => ({
  ok,
  status,
  text: async () => text,
  arrayBuffer: async () => arrayBuffer,
  headers: {
    get: (name: string) => {
      const matchedKey = Object.keys(headers).find(key => key.toLowerCase() === String(name).toLowerCase());
      return matchedKey ? headers[matchedKey] : null;
    }
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMiddleware = any;

function createTestApp(): Koa {
  const app = new Koa();
  // 使用类型断言绕过中间件类型不兼容问题
  app.use(cors() as AnyMiddleware);
  app.use(bodyParser() as AnyMiddleware);
  app.use(router.routes());
  app.use(router.allowedMethods());
  return app;
}

// 创建测试用的完整 UserInfo 对象
function createTestUserInfo(): UserInfo {
  return {
    loginUin: '123456',
    cookie: 'test_cookie=123',
    cookieList: ['test_cookie=123'],
    cookieObject: { test_cookie: '123' },
    refreshData: () => {}
  };
}

const expectSuccessResponse = (responseBody: ResponseBody) => {
  expect(responseBody).toHaveProperty('response');
  expect(responseBody).not.toHaveProperty('error');
  expect(responseBody.response).toHaveProperty('code');
  expect(responseBody.response).toHaveProperty('data');
};

const expectErrorResponse = (responseBody: ResponseBody) => {
  expect(responseBody).toHaveProperty('error');
  expect(responseBody).not.toHaveProperty('response');
};

describe('API Integration Tests', () => {
  let app: Koa;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let callback: any;
  let mockService: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).fetch = jest.fn();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).fetch;
  });

  describe('GET /getHotkey', () => {
    test('should return hot search keywords', async () => {
      const response = await request(callback).get('/getHotkey').expect(200);
      expectSuccessResponse(response.body);
    }, 10000);
  });

  describe('GET /getTopLists', () => {
    test('should return top lists', async () => {
      const response = await request(callback).get('/getTopLists').expect(200);
      expectSuccessResponse(response.body);
    }, 10000);
  });

  describe('GET /getSearchByKey', () => {
    test('should search with query param', async () => {
      const response = await request(callback)
        .get('/getSearchByKey')
        .query({ key: 'test' })
        .expect(200);
      expectSuccessResponse(response.body);
    }, 10000);

    test('should search with path param (backward compatibility)', async () => {
      const response = await request(callback).get('/getSearchByKey/test').expect(200);
      expectSuccessResponse(response.body);
    }, 10000);

    test('should return 400 for missing search key', async () => {
      const response = await request(callback).get('/getSearchByKey').expect(400);
      expect(response.body.response).toBe('search key is null');
    });
  });

  describe('GET /getLyric', () => {
    test('should return lyric with query param', async () => {
      const response = await request(callback)
        .get('/getLyric')
        .query({ songmid: 'test123' })
        .expect(200);
      expectSuccessResponse(response.body);
    }, 10000);
  });

  describe('GET /getMusicPlay', () => {
    test('should return 400 when songmid is missing', async () => {
      const response = await request(callback).get('/getMusicPlay').expect(400);

      expect(response.body).toEqual({
        data: {
          message: 'no songmid'
        }
      });
    });

    test('should return 502 and propagate upstream error when service fails', async () => {
      mockService.mockRejectedValueOnce(new Error('upstream error'));

      const response = await request(callback)
        .get('/getMusicPlay')
        .query({ songmid: 'test-songmid' })
        .expect(502);

      expect(response.body).toEqual({
        error: 'upstream error'
      });
    });

    test('should return play url map when upstream returns purl', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          req_0: {
            data: {
              sip: ['http://ws.stream.qqmusic.qq.com/', 'https://isure.stream.qqmusic.qq.com/'],
              midurlinfo: [
                {
                  songmid: 'test-mid-1',
                  purl: 'M500test-mid-1test-mid-1.mp3'
                }
              ]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getMusicPlay')
        .query({ songmid: 'test-mid-1' })
        .expect(200);

      expect(response.body).toEqual({
        data: {
          playUrl: {
            'test-mid-1': {
              url: 'https://isure.stream.qqmusic.qq.com/M500test-mid-1test-mid-1.mp3'
            }
          }
        }
      });
    });

    test('should handle comma-separated songmid list and include missing entries', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          req_0: {
            data: {
              sip: ['https://isure.stream.qqmusic.qq.com/'],
              midurlinfo: [
                {
                  songmid: 'a',
                  purl: 'M500aa.mp3'
                },
                {
                  songmid: 'b',
                  purl: 'M500bb.mp3'
                }
              ]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getMusicPlay')
        .query({ songmid: 'a,b,c' })
        .expect(200);

      const playUrl = response.body?.data?.playUrl;
      expect(playUrl).toHaveProperty('a');
      expect(playUrl).toHaveProperty('b');
      expect(playUrl).toHaveProperty('c');
      expect(playUrl.a.url).toBe('https://isure.stream.qqmusic.qq.com/M500aa.mp3');
      expect(playUrl.b.url).toBe('https://isure.stream.qqmusic.qq.com/M500bb.mp3');
      expect(playUrl.c.url).toBe('');
      expect(playUrl.c.error).toBeTruthy();
    });

    test('should handle repeated songmid query keys and include missing entries', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          req_0: {
            data: {
              sip: ['https://isure.stream.qqmusic.qq.com/'],
              midurlinfo: [
                {
                  songmid: 'a',
                  purl: 'M500aa.mp3'
                },
                {
                  songmid: 'b',
                  purl: 'M500bb.mp3'
                }
              ]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getMusicPlay?songmid=a&songmid=b&songmid=c')
        .expect(200);

      const playUrl = response.body?.data?.playUrl;
      expect(playUrl).toHaveProperty('a');
      expect(playUrl).toHaveProperty('b');
      expect(playUrl).toHaveProperty('c');
      expect(playUrl.a.url).toBe('https://isure.stream.qqmusic.qq.com/M500aa.mp3');
      expect(playUrl.b.url).toBe('https://isure.stream.qqmusic.qq.com/M500bb.mp3');
      expect(playUrl.c.url).toBe('');
      expect(playUrl.c.error).toBeTruthy();
    });

    test('should build fallback url when purl is empty but filename and vkey exist', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          req_0: {
            data: {
              sip: ['https://isure.stream.qqmusic.qq.com/'],
              midurlinfo: [
                {
                  songmid: 'test-mid-2',
                  purl: '',
                  filename: 'M500test-mid-2test-mid-2.mp3',
                  vkey: 'mock-vkey'
                }
              ]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getMusicPlay')
        .query({ songmid: 'test-mid-2' })
        .expect(200);

      const url = response.body?.data?.playUrl?.['test-mid-2']?.url as string;
      expect(url).toContain('https://isure.stream.qqmusic.qq.com/M500test-mid-2test-mid-2.mp3?vkey=mock-vkey');
      expect(url).toContain('&fromtag=66');
    });

    test('should keep url empty and set error when purl is empty and filename/vkey are missing', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          req_0: {
            data: {
              sip: ['https://isure.stream.qqmusic.qq.com/'],
              midurlinfo: [
                {
                  songmid: 'test-mid-empty',
                  purl: ''
                }
              ]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getMusicPlay')
        .query({ songmid: 'test-mid-empty' })
        .expect(200);

      const entry = response.body?.data?.playUrl?.['test-mid-empty'];
      expect(entry?.url).toBe('');
      expect(entry?.error).toBeTruthy();
    });

    test('should return full upstream payload when resType is not play', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          req_0: {
            data: {
              sip: ['https://isure.stream.qqmusic.qq.com/'],
              midurlinfo: [
                {
                  songmid: 'test-mid-3',
                  purl: 'M500test-mid-3test-mid-3.mp3'
                }
              ]
            }
          },
          extraField: 'mock-extra'
        }
      });

      const response = await request(callback)
        .get('/getMusicPlay')
        .query({ songmid: 'test-mid-3', resType: 'full' })
        .expect(200);

      expect(response.body.data.extraField).toBe('mock-extra');
      expect(response.body.data.playUrl).toEqual({
        'test-mid-3': {
          url: 'https://isure.stream.qqmusic.qq.com/M500test-mid-3test-mid-3.mp3'
        }
      });
    });
  });

  describe('POST /batchGetSongInfo', () => {
    test('should batch get song info', async () => {
      mockService
        .mockResolvedValueOnce({ data: { code: 0, data: [{ mid: 'test1' }] } })
        .mockResolvedValueOnce({ data: { code: 0, data: [{ mid: 'test2' }] } });

      const response = await request(callback)
        .post('/batchGetSongInfo')
        .send({ songs: [['test1', '1'], ['test2', '2']] })
        .expect(200);

      expectSuccessResponse(response.body);
      expect(Array.isArray(response.body.response.data)).toBe(true);
      expect(response.body.response.data).toHaveLength(2);
      expect(mockService).toHaveBeenCalledTimes(2);
    }, 10000);

    test('should return empty array when songs is missing', async () => {
      const response = await request(callback)
        .post('/batchGetSongInfo')
        .send({})
        .expect(200);

      expectSuccessResponse(response.body);
      expect(response.body.response.data).toEqual([]);
      expect(mockService).not.toHaveBeenCalled();
    });

    test('should use empty string as default song_id when it is omitted', async () => {
      mockService.mockResolvedValueOnce({ data: { code: 0, data: [{ mid: 'test1' }] } });

      await request(callback)
        .post('/batchGetSongInfo')
        .send({ songs: [['test1']] })
        .expect(200);

      const firstCallConfig = mockService.mock.calls[0][0] as { params: { data: { songinfo: { param: { song_id: string } } } } };
      expect(firstCallConfig.params.data.songinfo.param.song_id).toBe('');
    });
  });

  describe('GET /user/getUserPlaylists', () => {
    test('should return 400 when uin is missing', async () => {
      const response = await request(callback).get('/user/getUserPlaylists').expect(400);

      expectErrorResponse(response.body);
      expect(response.body.error).toBe('缺少 uin 参数');
    });

    test('should return playlists when upstream payload contains playlist field', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            playlists: [{ dissid: '1', dissname: 'test playlist' }]
          }
        }
      });

      const response = await request(callback)
        .get('/user/getUserPlaylists')
        .query({ uin: '123456789' })
        .expect(200);

      expectSuccessResponse(response.body);
      expect(response.body.response.data.playlists).toEqual([{ dissid: '1', dissname: 'test playlist' }]);
    });

    test('should return playlists when upstream payload contains creator.playlist field', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            creator: {
              playlist: [{ dissid: '2', dissname: 'creator playlist' }]
            }
          }
        }
      });

      const response = await request(callback)
        .get('/user/getUserPlaylists')
        .query({ uin: '123456789' })
        .expect(200);

      expectSuccessResponse(response.body);
      expect(response.body.response.data.playlists).toEqual([{ dissid: '2', dissname: 'creator playlist' }]);
    });

    test('should return 502 when upstream payload does not contain playlist field', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            profile: { uin: '123456789' }
          }
        }
      });

      const response = await request(callback)
        .get('/user/getUserPlaylists')
        .query({ uin: '123456789' })
        .expect(502);

      expectErrorResponse(response.body);
      expect(response.body.error).toBe('用户歌单响应中未找到歌单列表字段');
    });
  });

  describe('GET /user/getUserAvatar', () => {
    test('should return 400 when k and uin are both missing', async () => {
      const response = await request(callback).get('/user/getUserAvatar').expect(400);

      expectErrorResponse(response.body);
      expect(response.body.error).toBe('缺少 k 或 uin 参数');
    });

    test.each([
      ['non-numeric size', 'abc'],
      ['zero size', '0'],
      ['negative size', '-1']
    ])('should return 400 for %s', async (_caseName, size) => {
      const response = await request(callback)
        .get('/user/getUserAvatar')
        .query({ uin: '123456789', size })
        .expect(400);

      expectErrorResponse(response.body);
      expect(response.body.error).toBe('size 参数无效');
    });

    test('should return avatar url when uin is provided', async () => {
      const response = await request(callback)
        .get('/user/getUserAvatar')
        .query({ uin: '123456789', size: 140 })
        .expect(200);

      expectSuccessResponse(response.body);
      expect(response.body.response.data.avatarUrl).toBe(
        'https://q.qlogo.cn/headimg_dl?dst_uin=123456789&spec=140'
      );
    });

    test('should only use the first query value when duplicated params are provided', async () => {
      const response = await request(callback)
        .get('/user/getUserAvatar?uin=123456789&uin=987654321&size=140&size=640')
        .expect(200);

      expectSuccessResponse(response.body);
      expect(response.body.response.data.avatarUrl).toBe(
        'https://q.qlogo.cn/headimg_dl?dst_uin=123456789&spec=140'
      );
    });

    test('should prefer k over uin when both are provided', async () => {
      const response = await request(callback)
        .get('/user/getUserAvatar')
        .query({ k: 'mock-k', uin: '123456789', size: 640 })
        .expect(200);

      expectSuccessResponse(response.body);
      expect(response.body.response.data.avatarUrl).toBe(
        'https://thirdqq.qlogo.cn/g?b=sdk&k=mock-k&s=640'
      );
    });
  });

  describe('GET /getMvPlay', () => {
    test('should return 400 when vid is missing', async () => {
      const response = await request(callback).get('/getMvPlay').expect(400);

      expect(response.body.response).toBe('vid is null');
    });

    test('should return grouped playLists when upstream returns nested freeflow urls', async () => {
      const createMvUrlEntry = (...urls: string[]): MockMvUrlEntry => ({
        freeflow_url: urls
      });

      mockService.mockResolvedValueOnce({
        data: {
          getMVUrl: {
            data: {
              testVid: {
                mp4: [
                  createMvUrlEntry('https://cdn.example.com/video.f10.mp4'),
                  createMvUrlEntry('https://cdn.example.com/video.f20.mp4')
                ],
                hls: [createMvUrlEntry('https://cdn.example.com/video.f30.mp4')]
              }
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getMvPlay')
        .query({ vid: 'testVid' })
        .expect(200);

      expect((response.body as ResponseBody).response).toMatchObject({
        playLists: {
          f10: ['https://cdn.example.com/video.f10.mp4'],
          f20: ['https://cdn.example.com/video.f20.mp4'],
          f30: ['https://cdn.example.com/video.f30.mp4'],
          f40: []
        }
      });
    });

    test('should handle payloads with only hls urls', async () => {
      const createMvUrlEntry = (...urls: string[]): MockMvUrlEntry => ({
        freeflow_url: urls
      });

      mockService.mockResolvedValueOnce({
        data: {
          getMVUrl: {
            data: {
              testVid: {
                hls: [
                  createMvUrlEntry('https://cdn.example.com/video.f30.mp4'),
                  createMvUrlEntry('https://cdn.example.com/video.f40.mp4')
                ]
              }
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getMvPlay')
        .query({ vid: 'testVid' })
        .expect(200);

      expect((response.body as ResponseBody).response).toMatchObject({
        playLists: {
          f10: [],
          f20: [],
          f30: ['https://cdn.example.com/video.f30.mp4'],
          f40: ['https://cdn.example.com/video.f40.mp4']
        }
      });
    });

    test('should return empty grouped lists when all freeflow urls are empty', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          getMVUrl: {
            data: {
              testVid: {
                mp4: [{ freeflow_url: [] }],
                hls: [{ freeflow_url: [] }]
              }
            }
          }
        }
      });

      const response = await request(callback)
        .get('/getMvPlay')
        .query({ vid: 'testVid' })
        .expect(200);

      expect((response.body as ResponseBody).response).toMatchObject({
        playLists: {
          f10: [],
          f20: [],
          f30: [],
          f40: []
        }
      });
    });

    test('should return 502 when upstream mv url payload is empty', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          getMVUrl: {
            data: {}
          }
        }
      });

      const response = await request(callback)
        .get('/getMvPlay')
        .query({ vid: 'testVid' })
        .expect(502);

      expect((response.body as ResponseBody).response).toEqual({
        data: null,
        error: 'Failed to get MV URL data'
      });
    });
  });

  describe('POST /batchGetSongLists', () => {
    test('should use default categoryIds when request body omits them', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            list: [{ disstid: 'default-category' }]
          }
        }
      });

      const response = await request(callback)
        .post('/batchGetSongLists')
        .send({})
        .expect(200);

      expect(response.body).toEqual({
        status: 200,
        data: [{ list: [{ disstid: 'default-category' }] }]
      });
      expect(mockService).toHaveBeenCalledTimes(1);
      const firstCallConfig = mockService.mock.calls[0][0] as { params: { categoryId: number } };
      expect(firstCallConfig.params.categoryId).toBe(10000000);
    });

    test('should request each categoryId and merge downstream success payloads', async () => {
      mockService
        .mockResolvedValueOnce({ data: { code: 0, data: { list: [{ disstid: 'cat-1' }] } } })
        .mockResolvedValueOnce({ data: { code: 0, data: { list: [{ disstid: 'cat-2' }] } } });

      const response = await request(callback)
        .post('/batchGetSongLists')
        .send({ categoryIds: [1, 2], limit: 10, page: 2, sortId: 5 })
        .expect(200);

      expect(response.body).toEqual({
        status: 200,
        data: [{ list: [{ disstid: 'cat-1' }] }, { list: [{ disstid: 'cat-2' }] }]
      });
      expect(mockService).toHaveBeenCalledTimes(2);
    });

    test('should preserve downstream business error payloads', async () => {
      mockService.mockResolvedValueOnce({
        data: {
          code: 1,
          message: 'mock song list error'
        }
      });

      const response = await request(callback)
        .post('/batchGetSongLists')
        .send({ categoryIds: [1] })
        .expect(200);

      expect(response.body).toEqual({
        status: 200,
        data: [{ code: 1, message: 'mock song list error' }]
      });
    });
  });

  describe('Error handling', () => {
    test('should return 404 for unknown route', async () => {
      await request(callback).get('/unknown-route').expect(404);
    });

    test('should return 500 when downstream request rejects', async () => {
      mockService.mockRejectedValueOnce(new Error('downstream failure'));
      const response = await request(callback).get('/getHotkey').expect(500);
      expect(response.body.error).toBeDefined();
    });

    test('should preserve non-success business response code from downstream', async () => {
      mockService.mockResolvedValueOnce({ data: { code: 1, message: 'mock business error' } });
      const response = await request(callback).get('/getHotkey').expect(200);
      expect(response.body.response).toEqual({ code: 1, message: 'mock business error' });
    });
  });

  describe('QQ QR login endpoints', () => {
    test('GET /getQQLoginQr should return base64 QR and ptqrtoken/qrsig', async () => {
      const qrBuffer = Buffer.from('fake-qr-image-bytes');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).fetch = jest.fn().mockResolvedValueOnce(
        createFetchResponse({
          arrayBuffer: qrBuffer,
          headers: {
            'Set-Cookie': 'qrsig=mockQrSig; Path=/; HttpOnly'
          }
        })
      );

      const response = await request(callback).get('/getQQLoginQr').expect(200);

      expect(response.body.img).toBe(`data:image/png;base64,${qrBuffer.toString('base64')}`);
      expect(response.body.ptqrtoken).toBeDefined();
      expect(response.body.qrsig).toBe('mockQrSig');
    });

    test('POST /checkQQLoginQr should return 400 when ptqrtoken/qrsig are missing', async () => {
      const response = await request(callback).post('/checkQQLoginQr').send({}).expect(400);

      expect(response.body.error).toBe('参数错误');
    });

    test('POST /checkQQLoginQr should return session on success', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).fetch = jest
        .fn()
        .mockResolvedValueOnce(
          createFetchResponse({
            text: "ptuiCB('0','0','登录成功！','https://ssl.ptlogin2.qq.com/check_sig?uin=123456789','0','0');",
            headers: {
              'Set-Cookie': 'pt_login_sig=abc123; Path=/; HttpOnly'
            }
          })
        )
        .mockResolvedValueOnce(
          createFetchResponse({
            headers: {
              'Set-Cookie': 'p_skey=mockPSkey; Path=/; HttpOnly, uin=o123456789; Path=/; HttpOnly'
            }
          })
        )
        .mockResolvedValueOnce(
          createFetchResponse({
            status: 302,
            headers: {
              Location: 'https://y.qq.com/portal/wx_redirect.html?code=mockAuthCode',
              'Set-Cookie': 'graph_key=graphValue; Path=/; HttpOnly'
            }
          })
        )
        .mockResolvedValueOnce(
          createFetchResponse({
            headers: {
              'Set-Cookie': 'qm_keyst=finalValue; Path=/; HttpOnly'
            }
          })
        );

      const response = await request(callback)
        .post('/checkQQLoginQr')
        .send({ ptqrtoken: 'mockToken', qrsig: 'mockQrSig' })
        .expect(200);

      expect(response.body.isOk).toBe(true);
      expect(response.body.message).toBe('登录成功');
      expect(response.body.session).toBeDefined();
      expect(response.body.session.loginUin).toBe('o123456789');
      expect(response.body.session.cookie).toContain('uin=o123456789');
      expect(response.body.session.cookie).toContain('qm_keyst=finalValue');
      expect(Array.isArray(response.body.session.cookieList)).toBe(true);
      expect(response.body.session.cookieList.length).toBeGreaterThan(0);
      expect(response.body.session.cookieObject).toMatchObject({
        uin: 'o123456789',
        p_skey: 'mockPSkey',
        qm_keyst: 'finalValue'
      });
    });

    test('POST /checkQQLoginQr should return 502 when checkSigUrl cannot be extracted', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).fetch = jest.fn().mockResolvedValueOnce(
        createFetchResponse({
          text: "ptuiCB('0','0','登录成功！','','0','0');",
          headers: {
            'Set-Cookie': 'pt_login_sig=abc123; Path=/; HttpOnly'
          }
        })
      );

      const response = await request(callback)
        .post('/checkQQLoginQr')
        .send({ ptqrtoken: 'mockToken', qrsig: 'mockQrSig' })
        .expect(502);

      expect(response.body.error).toBe('Failed to extract checkSigUrl from response');
    });

    test('POST /checkQQLoginQr should return 502 when p_skey is missing', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).fetch = jest
        .fn()
        .mockResolvedValueOnce(
          createFetchResponse({
            text: "ptuiCB('0','0','登录成功！','https://ssl.ptlogin2.qq.com/check_sig?uin=123456789','0','0');",
            headers: {
              'Set-Cookie': 'pt_login_sig=abc123; Path=/; HttpOnly'
            }
          })
        )
        .mockResolvedValueOnce(
          createFetchResponse({
            headers: {
              'Set-Cookie': 'uin=o123456789; Path=/; HttpOnly'
            }
          })
        );

      const response = await request(callback)
        .post('/checkQQLoginQr')
        .send({ ptqrtoken: 'mockToken', qrsig: 'mockQrSig' })
        .expect(502);

      expect(response.body.error).toBe('Failed to extract p_skey from response');
    });

    test('POST /checkQQLoginQr should return 502 when authorize response does not redirect', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).fetch = jest
        .fn()
        .mockResolvedValueOnce(
          createFetchResponse({
            text: "ptuiCB('0','0','登录成功！','https://ssl.ptlogin2.qq.com/check_sig?uin=123456789','0','0');",
            headers: {
              'Set-Cookie': 'pt_login_sig=abc123; Path=/; HttpOnly'
            }
          })
        )
        .mockResolvedValueOnce(
          createFetchResponse({
            headers: {
              'Set-Cookie': 'p_skey=mockPSkey; Path=/; HttpOnly, uin=o123456789; Path=/; HttpOnly'
            }
          })
        )
        .mockResolvedValueOnce(
          createFetchResponse({
            status: 200,
            headers: {
              'Content-Type': 'text/html; charset=utf-8'
            }
          })
        );

      const response = await request(callback)
        .post('/checkQQLoginQr')
        .send({ ptqrtoken: 'mockToken', qrsig: 'mockQrSig' })
        .expect(502);

      expect(response.body.error).toBe('授权响应异常，未返回跳转地址');
    });

    test('POST /checkQQLoginQr should return 502 when authorize redirect location misses code', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).fetch = jest
        .fn()
        .mockResolvedValueOnce(
          createFetchResponse({
            text: "ptuiCB('0','0','登录成功！','https://ssl.ptlogin2.qq.com/check_sig?uin=123456789','0','0');",
            headers: {
              'Set-Cookie': 'pt_login_sig=abc123; Path=/; HttpOnly'
            }
          })
        )
        .mockResolvedValueOnce(
          createFetchResponse({
            headers: {
              'Set-Cookie': 'p_skey=mockPSkey; Path=/; HttpOnly, uin=o123456789; Path=/; HttpOnly'
            }
          })
        )
        .mockResolvedValueOnce(
          createFetchResponse({
            status: 302,
            headers: {
              Location: 'https://y.qq.com/portal/wx_redirect.html?state=mockState'
            }
          })
        );

      const response = await request(callback)
        .post('/checkQQLoginQr')
        .send({ ptqrtoken: 'mockToken', qrsig: 'mockQrSig' })
        .expect(502);

      expect(response.body.error).toBe('授权响应中未找到 code 参数');
    });

    test('POST /checkQQLoginQr should return 504 and 登录检查超时 on fetch timeout', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).fetch = jest.fn().mockRejectedValueOnce(abortError);

      const response = await request(callback)
        .post('/checkQQLoginQr')
        .send({ ptqrtoken: 'mockToken', qrsig: 'mockQrSig' })
        .expect(504);

      expect(response.body).toEqual({
        error: '登录检查超时'
      });
    });

    test('POST /checkQQLoginQr should map non-success polling result to 未扫描二维码', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).fetch = jest.fn().mockResolvedValueOnce(
        createFetchResponse({
          text: 'ptuiCB("66","0","","0","二维码未失效","","");'
        })
      );

      const response = await request(callback)
        .post('/checkQQLoginQr')
        .send({ ptqrtoken: 'mockToken', qrsig: 'mockQrSig' })
        .expect(200);

      expect(response.body).toEqual({
        isOk: false,
        refresh: false,
        message: '未扫描二维码'
      });
    });

    test('POST /checkQQLoginQr should map expired polling result to 二维码已失效', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).fetch = jest.fn().mockResolvedValueOnce(
        createFetchResponse({
          text: 'ptuiCB("65","0","二维码已失效","0","二维码已失效","","");'
        })
      );

      const response = await request(callback)
        .post('/checkQQLoginQr')
        .send({ ptqrtoken: 'mockToken', qrsig: 'mockQrSig' })
        .expect(200);

      expect(response.body).toEqual({
        isOk: false,
        refresh: true,
        message: '二维码已失效'
      });
    });

    test('GET /getQQLoginQr should map upstream failure to 502', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).fetch = jest.fn().mockRejectedValueOnce(new Error('network timeout'));

      const response = await request(callback).get('/getQQLoginQr').expect(502);

      expect(response.body.error).toBe('Failed to fetch QQ login QR');
    });
  });

  describe('CORS middleware', () => {
    test('should set CORS headers', async () => {
      const response = await request(callback).get('/getHotkey').expect(200);
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});
